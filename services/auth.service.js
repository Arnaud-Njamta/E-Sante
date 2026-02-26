const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Patient } = require('../models');
const emailService = require('./email.service');

const SALT_ROUNDS = 12;

/**
 * Inscription d'un nouveau patient
 */
const register = async ({ email, password, nom, prenom, date_naissance, telephone }) => {
  const existingPatient = await Patient.findOne({ where: { email } });
  if (existingPatient) {
    const error = new Error('Un compte avec cet email existe déjà');
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const patient = await Patient.create({
    email,
    password_hash,
    nom,
    prenom,
    date_naissance,
    telephone,
  });

  const token = generateToken(patient.id);
  const refreshToken = generateRefreshToken(patient.id);

  return {
    patient: formatPatient(patient),
    token,
    refreshToken,
  };
};

/**
 * Connexion d'un patient
 */
const login = async ({ email, password }) => {
  const patient = await Patient.findOne({ where: { email } });
  if (!patient) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, patient.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(patient.id);
  const refreshToken = generateRefreshToken(patient.id);

  return {
    patient: formatPatient(patient),
    token,
    refreshToken,
  };
};

/**
 * Rafraîchir le token JWT
 */
const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const patient = await Patient.findByPk(decoded.id);

    if (!patient) {
      const error = new Error('Patient non trouvé');
      error.statusCode = 404;
      throw error;
    }

    const newToken = generateToken(patient.id);
    const newRefreshToken = generateRefreshToken(patient.id);

    return { token: newToken, refreshToken: newRefreshToken };
  } catch (err) {
    const error = new Error('Token de rafraîchissement invalide');
    error.statusCode = 401;
    throw error;
  }
};

/**
 * Mot de passe oublié — Génère un token et envoie un email
 */
const forgotPassword = async (email) => {
  const patient = await Patient.findOne({ where: { email } });

  // Pour des raisons de sécurité, on retourne toujours le même message
  // même si l'email n'existe pas (évite l'énumération des comptes)
  if (!patient) {
    return {
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    };
  }

  // Générer un token aléatoire
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Stocker le hash du token en base (pour la sécurité)
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Sauvegarder le token et l'expiration (1 heure)
  patient.reset_password_token = hashedToken;
  patient.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000);
  await patient.save();

  // Envoyer l'email avec le token non hashé (le patient l'utilisera pour réinitialiser)
  await emailService.sendResetPasswordEmail(patient.email, resetToken);

  return {
    message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
  };
};

/**
 * Réinitialisation du mot de passe avec le token
 */
const resetPassword = async (token, newPassword) => {
  // Hasher le token reçu pour le comparer avec celui en base
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Chercher le patient avec ce token et vérifier l'expiration
  const patient = await Patient.findOne({
    where: {
      reset_password_token: hashedToken,
    },
  });

  if (!patient || !patient.reset_password_expires || patient.reset_password_expires < new Date()) {
    const error = new Error('Token invalide ou expiré');
    error.statusCode = 400;
    throw error;
  }

  // Mettre à jour le mot de passe
  patient.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Invalider le token
  patient.reset_password_token = null;
  patient.reset_password_expires = null;

  await patient.save();

  return {
    message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
  };
};

// ==================== HELPERS INTERNES ====================

const generateToken = (patientId) => {
  return jwt.sign({ id: patientId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (patientId) => {
  return jwt.sign({ id: patientId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const formatPatient = (patient) => {
  const { password_hash, reset_password_token, reset_password_expires, ...patientData } = patient.toJSON();
  return patientData;
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
