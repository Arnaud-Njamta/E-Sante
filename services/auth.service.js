const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  Patient, Medecin, Etablissement, Admin, InscriptionProfessionnel,
} = require('../models');
const { USER_ROLES, TYPE_ETABLISSEMENT, STATUT_VALIDATION } = require('../utils/constants');
const emailService = require('./email.service');
const { smsConfig } = require('../config/sms');
const otpService = require('./otp.service');
const { OTP_USAGES } = require('../config/sms');

const SALT_ROUNDS = 12;

const register = async ({
  email, password, nom, prenom, date_naissance, telephone, otp_verification_token,
}) => {
  const existingPatient = await Patient.findOne({ where: { email } });
  if (existingPatient) {
    const error = new Error('Un compte avec cet email existe déjà');
    error.statusCode = 409;
    throw error;
  }

  let normalizedPhone = telephone;
  let phoneVerified = false;

  if (smsConfig.otpRequired) {
    if (!telephone || !otp_verification_token) {
      const error = new Error('Vérification du téléphone par SMS requise');
      error.statusCode = 400;
      throw error;
    }
    const verified = await otpService.consumeVerificationToken({
      verificationToken: otp_verification_token,
      telephone,
      usage: OTP_USAGES.REGISTER,
    });
    normalizedPhone = verified.telephone;
    phoneVerified = true;
  } else if (telephone) {
    normalizedPhone = otpService.normalizeTelephone(telephone);
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const patient = await Patient.create({
    email,
    password_hash,
    nom,
    prenom,
    date_naissance,
    telephone: normalizedPhone || null,
    telephone_verifie: phoneVerified,
  });

  // Bienvenue e-mail (ne bloque pas l'inscription)
  setImmediate(() => {
    emailService.sendWelcomeEmail({ email, prenom, nom }).catch(() => {});
  });

  const token = generateToken(patient.id, USER_ROLES.PATIENT);
  const refreshToken = generateRefreshToken(patient.id, USER_ROLES.PATIENT);

  return {
    user: formatProfile(patient, USER_ROLES.PATIENT),
    role: USER_ROLES.PATIENT,
    patient: formatProfile(patient, USER_ROLES.PATIENT),
    token,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  const admin = await Admin.findOne({ where: { email: normalizedEmail, actif: true } });
  if (admin) {
    return loginEntity(admin, password, USER_ROLES.ADMIN);
  }

  const patient = await Patient.findOne({ where: { email: normalizedEmail } });
  if (patient) {
    return loginEntity(patient, password, USER_ROLES.PATIENT);
  }

  const medecin = await Medecin.findOne({ where: { email: normalizedEmail } });
  if (medecin) {
    return loginEntity(medecin, password, USER_ROLES.MEDECIN);
  }

  const pharmacie = await Etablissement.findOne({
    where: { email: normalizedEmail, type: TYPE_ETABLISSEMENT.PHARMACIE },
  });
  if (pharmacie) {
    return loginEntity(pharmacie, password, USER_ROLES.PHARMACIE);
  }

  const hopital = await Etablissement.findOne({
    where: { email: normalizedEmail, type: TYPE_ETABLISSEMENT.HOPITAL },
  });
  if (hopital) {
    return loginEntity(hopital, password, USER_ROLES.HOPITAL);
  }

  const clinique = await Etablissement.findOne({
    where: { email: normalizedEmail, type: TYPE_ETABLISSEMENT.CLINIQUE },
  });
  if (clinique) {
    return loginEntity(clinique, password, USER_ROLES.CLINIQUE);
  }

  const pendingInscription = await InscriptionProfessionnel.findOne({
    where: {
      email: normalizedEmail,
      statut: ['en_attente', 'en_revision', 'documents_manquants'],
    },
    order: [['createdAt', 'DESC']],
  });
  if (pendingInscription && !pendingInscription.compte_cree_id) {
    const error = new Error(
      'Votre demande est encore en cours de création. Réessayez dans un instant, '
      + 'ou contactez le support si le problème persiste.',
    );
    error.statusCode = 403;
    throw error;
  }

  const error = new Error('Email ou mot de passe incorrect');
  error.statusCode = 401;
  throw error;
};

const loginEntity = async (entity, password, role) => {
  if (!entity.password_hash) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, entity.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  const statut = entity.statut_validation;
  if (statut === STATUT_VALIDATION.REJETE || statut === STATUT_VALIDATION.SUSPENDU) {
    const error = new Error(
      statut === STATUT_VALIDATION.SUSPENDU
        ? 'Compte suspendu — contactez le support DjamSanté'
        : 'Compte rejeté — contactez le support ou soumettez une nouvelle demande',
    );
    error.statusCode = 403;
    throw error;
  }

  // en_attente : connexion autorisée — documents / validation MINSANTE peuvent être complétés ensuite
  const token = generateToken(entity.id, role);
  const refreshToken = generateRefreshToken(entity.id, role);
  const profile = formatProfile(entity, role);

  return {
    user: profile,
    role,
    patient: role === USER_ROLES.PATIENT ? profile : undefined,
    medecin: role === USER_ROLES.MEDECIN ? profile : undefined,
    pharmacie: role === USER_ROLES.PHARMACIE ? profile : undefined,
    hopital: role === USER_ROLES.HOPITAL ? profile : undefined,
    clinique: role === USER_ROLES.CLINIQUE ? profile : undefined,
    admin: role === USER_ROLES.ADMIN ? profile : undefined,
    token,
    refreshToken,
    validation_pending: statut === STATUT_VALIDATION.EN_ATTENTE,
  };
};

const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const profile = await loadProfile(decoded.id, decoded.role);

    if (!profile) {
      const error = new Error('Utilisateur non trouvé');
      error.statusCode = 404;
      throw error;
    }

    const newToken = generateToken(decoded.id, decoded.role);
    const newRefreshToken = generateRefreshToken(decoded.id, decoded.role);

    return { token: newToken, refreshToken: newRefreshToken };
  } catch (err) {
    const error = new Error('Token de rafraîchissement invalide');
    error.statusCode = 401;
    throw error;
  }
};

const forgotPassword = async (email) => {
  const account = await findAccountByEmail(email);

  if (!account) {
    return {
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  await setResetToken(account.entity, resetToken);
  await emailService.sendResetPasswordEmail(account.entity.email, resetToken);

  return {
    message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
  };
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const tables = [
    { Model: Patient },
    { Model: Medecin },
    { Model: Etablissement },
    { Model: Admin },
  ];

  let entity = null;
  for (const { Model } of tables) {
    entity = await Model.findOne({ where: { reset_password_token: hashedToken } });
    if (entity) break;
  }

  if (!entity || !entity.reset_password_expires || entity.reset_password_expires < new Date()) {
    const error = new Error('Token invalide ou expiré');
    error.statusCode = 400;
    throw error;
  }

  entity.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  entity.reset_password_token = null;
  entity.reset_password_expires = null;
  await entity.save();

  return {
    message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
  };
};

const loadProfile = async (id, role) => {
  if (role === USER_ROLES.ADMIN) {
    const admin = await Admin.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    return admin ? formatProfile(admin, role) : null;
  }
  if (role === USER_ROLES.PATIENT) {
    const patient = await Patient.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    return patient ? formatProfile(patient, role) : null;
  }
  if (role === USER_ROLES.MEDECIN) {
    const medecin = await Medecin.findByPk(id, { attributes: { exclude: ['password_hash'] } });
    return medecin ? formatProfile(medecin, role) : null;
  }
  if (role === USER_ROLES.PHARMACIE || role === USER_ROLES.HOPITAL || role === USER_ROLES.CLINIQUE) {
    const typeMap = {
      [USER_ROLES.PHARMACIE]: TYPE_ETABLISSEMENT.PHARMACIE,
      [USER_ROLES.HOPITAL]: TYPE_ETABLISSEMENT.HOPITAL,
      [USER_ROLES.CLINIQUE]: TYPE_ETABLISSEMENT.CLINIQUE,
    };
    const etab = await Etablissement.findOne({
      where: { id, type: typeMap[role] },
      attributes: { exclude: ['password_hash'] },
    });
    return etab ? formatProfile(etab, role) : null;
  }
  return null;
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const formatProfile = (entity, role) => {
  const data = entity.toJSON();
  delete data.password_hash;
  delete data.reset_password_token;
  delete data.reset_password_expires;
  if (data.fichier_photo_id && !data.photo_url) {
    data.photo_url = `/api/fichiers/${data.fichier_photo_id}`;
  }
  return { ...data, role };
};

const findAccountByEmail = async (email) => {
  const admin = await Admin.findOne({ where: { email, actif: true } });
  if (admin) return { entity: admin, role: USER_ROLES.ADMIN };

  const patient = await Patient.findOne({ where: { email } });
  if (patient) return { entity: patient, role: USER_ROLES.PATIENT };

  const medecin = await Medecin.findOne({ where: { email } });
  if (medecin) return { entity: medecin, role: USER_ROLES.MEDECIN };

  const pharmacie = await Etablissement.findOne({ where: { email, type: TYPE_ETABLISSEMENT.PHARMACIE } });
  if (pharmacie) return { entity: pharmacie, role: USER_ROLES.PHARMACIE };

  const hopital = await Etablissement.findOne({ where: { email, type: TYPE_ETABLISSEMENT.HOPITAL } });
  if (hopital) return { entity: hopital, role: USER_ROLES.HOPITAL };

  const clinique = await Etablissement.findOne({ where: { email, type: TYPE_ETABLISSEMENT.CLINIQUE } });
  if (clinique) return { entity: clinique, role: USER_ROLES.CLINIQUE };

  return null;
};

const setResetToken = async (entity, resetToken) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  entity.reset_password_token = hashedToken;
  entity.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000);
  await entity.save();
};

const resetPasswordBySms = async ({ telephone, otp_verification_token, password }) => {
  await otpService.consumeVerificationToken({
    verificationToken: otp_verification_token,
    telephone,
    usage: OTP_USAGES.RESET_PASSWORD,
  });

  const normalizedPhone = otpService.normalizeTelephone(telephone);
  const patient = await Patient.findOne({ where: { telephone: normalizedPhone } });

  if (!patient) {
    const error = new Error('Compte introuvable pour ce numéro');
    error.statusCode = 404;
    throw error;
  }

  patient.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  patient.reset_password_token = null;
  patient.reset_password_expires = null;
  await patient.save();

  return {
    message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
  };
};

const changePassword = async (userId, role, currentPassword, newPassword) => {
  const profile = await loadProfile(userId, role);
  if (!profile) {
    const error = new Error('Utilisateur non trouvé');
    error.statusCode = 404;
    throw error;
  }

  let entity;
  if (role === USER_ROLES.PATIENT) entity = await Patient.findByPk(userId);
  else if (role === USER_ROLES.MEDECIN) entity = await Medecin.findByPk(userId);
  else if (role === USER_ROLES.ADMIN) entity = await Admin.findByPk(userId);
  else if ([USER_ROLES.PHARMACIE, USER_ROLES.HOPITAL, USER_ROLES.CLINIQUE].includes(role)) {
    const typeMap = {
      [USER_ROLES.PHARMACIE]: TYPE_ETABLISSEMENT.PHARMACIE,
      [USER_ROLES.HOPITAL]: TYPE_ETABLISSEMENT.HOPITAL,
      [USER_ROLES.CLINIQUE]: TYPE_ETABLISSEMENT.CLINIQUE,
    };
    entity = await Etablissement.findOne({ where: { id: userId, type: typeMap[role] } });
  }

  if (!entity?.password_hash) {
    const error = new Error('Compte introuvable');
    error.statusCode = 404;
    throw error;
  }

  const valid = await bcrypt.compare(currentPassword, entity.password_hash);
  if (!valid) {
    const error = new Error('Mot de passe actuel incorrect');
    error.statusCode = 401;
    throw error;
  }

  entity.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  entity.reset_password_token = null;
  entity.reset_password_expires = null;
  await entity.save();

  return { message: 'Mot de passe modifié avec succès.' };
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  resetPasswordBySms,
  changePassword,
  loadProfile,
  findAccountByEmail,
};
