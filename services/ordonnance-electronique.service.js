const crypto = require('crypto');
const { OrdonnanceElectronique, Patient, Medecin } = require('../models');
const { STATUT_ORDONNANCE_ELEC } = require('../utils/constants');
const auditLog = require('./ordonnance-audit.service');

const genererNumero = () => {
  const annee = new Date().getFullYear();
  const seq = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-SN-${annee}-${seq}`;
};

const genererCodeVerification = () => crypto.randomBytes(6).toString('hex').toUpperCase();

const formatOrdonnanceUrls = (ord, medecin) => {
  const plain = ord.toJSON ? ord.toJSON() : ord;
  return {
    ...plain,
    cachet_url: plain.fichier_cachet_id ? `/api/fichiers/${plain.fichier_cachet_id}` : null,
    signature_url: plain.fichier_signature_id ? `/api/fichiers/${plain.fichier_signature_id}` : null,
    medecin: medecin ? {
      id: medecin.id,
      nom: medecin.nom,
      prenom: medecin.prenom,
      specialite: medecin.specialite,
      numero_ordre: medecin.numero_ordre,
      cachet_url: medecin.fichier_cachet_id ? `/api/fichiers/${medecin.fichier_cachet_id}` : null,
      signature_url: medecin.fichier_signature_id ? `/api/fichiers/${medecin.fichier_signature_id}` : null,
    } : plain.medecin,
  };
};

const creer = async (medecinId, { patient_id, rendez_vous_id, diagnostic, medicaments, instructions }) => {
  const patient = await Patient.findByPk(patient_id);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  if (rendez_vous_id) {
    const { RendezVous } = require('../models');
    const { STATUT_RDV } = require('../utils/constants');
    const rdv = await RendezVous.findOne({
      where: {
        id: rendez_vous_id,
        medecin_id: medecinId,
        patient_id,
        statut: { [require('sequelize').Op.in]: [STATUT_RDV.CONFIRME, STATUT_RDV.TERMINE] },
      },
    });
    if (!rdv) {
      const error = new Error('Rendez-vous invalide — confirmez ou terminez la consultation avant l\'ordonnance');
      error.statusCode = 400;
      throw error;
    }
  }

  const medecin = await Medecin.findByPk(medecinId);
  if (!medecin?.fichier_cachet_id) {
    const error = new Error('Veuillez d\'abord charger votre cachet électronique dans Paramètres');
    error.statusCode = 400;
    throw error;
  }
  if (!medecin?.fichier_signature_id) {
    const error = new Error('Veuillez d\'abord enregistrer votre signature électronique dans Paramètres');
    error.statusCode = 400;
    throw error;
  }

  const expiration = new Date();
  expiration.setMonth(expiration.getMonth() + 3);

  const ord = await OrdonnanceElectronique.create({
    numero_unique: genererNumero(),
    medecin_id: medecinId,
    patient_id,
    rendez_vous_id: rendez_vous_id || null,
    diagnostic,
    medicaments: medicaments || [],
    instructions,
    fichier_cachet_id: medecin.fichier_cachet_id,
    fichier_signature_id: medecin.fichier_signature_id,
    statut: STATUT_ORDONNANCE_ELEC.BROUILLON,
    date_expiration: expiration.toISOString().split('T')[0],
    code_verification: genererCodeVerification(),
  });
  await auditLog.log(ord.id, 'creee', 'medecin', medecinId, { numero: ord.numero_unique });
  return formatOrdonnanceUrls(ord, medecin);
};

const signer = async (medecinId, ordonnanceId) => {
  const ord = await OrdonnanceElectronique.findOne({
    where: { id: ordonnanceId, medecin_id: medecinId },
  });
  if (!ord) {
    const error = new Error('Ordonnance non trouvée');
    error.statusCode = 404;
    throw error;
  }
  if (!ord.medicaments?.length) {
    const error = new Error('Ajoutez au moins un médicament');
    error.statusCode = 400;
    throw error;
  }
  if (!ord.fichier_cachet_id || !ord.fichier_signature_id) {
    const error = new Error('Cachet et signature électroniques requis pour signer');
    error.statusCode = 400;
    throw error;
  }

  const medecin = await Medecin.findByPk(medecinId);
  ord.statut = STATUT_ORDONNANCE_ELEC.SIGNEE;
  await ord.save();
  await auditLog.log(ord.id, 'signee', 'medecin', medecinId);

  const patient = await Patient.findByPk(ord.patient_id, { attributes: ['email', 'prenom', 'nom'] });
  const emailService = require('./email.service');
  emailService.sendOrdonnancePatientEmail({
    patientEmail: patient?.email,
    patientPrenom: patient?.prenom,
    numero: ord.numero_unique,
    medecinLabel: medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'votre médecin',
  }).catch(() => {});

  return formatOrdonnanceUrls(ord, medecin);
};

const listerMedecin = async (medecinId) => {
  const rows = await OrdonnanceElectronique.findAll({
    where: { medecin_id: medecinId },
    include: [{ model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom'] }],
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  return rows.map((r) => formatOrdonnanceUrls(r));
};

const listerPatient = async (patientId) => {
  const rows = await OrdonnanceElectronique.findAll({
    where: { patient_id: patientId, statut: STATUT_ORDONNANCE_ELEC.SIGNEE },
    include: [{
      model: Medecin,
      as: 'medecin',
      attributes: ['id', 'nom', 'prenom', 'specialite', 'numero_ordre', 'fichier_cachet_id', 'fichier_signature_id'],
    }],
    order: [['createdAt', 'DESC']],
  });
  return rows.map((r) => formatOrdonnanceUrls(r, r.medecin));
};

const getDocument = async (ordonnanceId, userId, role) => {
  const ord = await OrdonnanceElectronique.findByPk(ordonnanceId, {
    include: [
      { model: Medecin, as: 'medecin' },
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'date_naissance'] },
    ],
  });
  if (!ord) {
    const error = new Error('Ordonnance non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const isPatient = role === 'patient' && ord.patient_id === userId;
  const isMedecin = role === 'medecin' && ord.medecin_id === userId;
  const isPro = ['pharmacie', 'hopital', 'clinique', 'admin'].includes(role);

  if (!isPatient && !isMedecin && !isPro) {
    const error = new Error('Accès non autorisé');
    error.statusCode = 403;
    throw error;
  }
  if (ord.statut !== STATUT_ORDONNANCE_ELEC.SIGNEE && ord.statut !== STATUT_ORDONNANCE_ELEC.DELIVREE) {
    const error = new Error('Ordonnance non encore signée');
    error.statusCode = 400;
    throw error;
  }

  const formatted = formatOrdonnanceUrls(ord, ord.medecin);
  return {
    ...formatted,
    patient: ord.patient,
    legal_notice: 'Document électronique signé conformément au secret médical et à la réglementation camerounaise. '
      + 'Vérification : numéro unique + code de vérification.',
    signed_at: ord.updatedAt,
  };
};

const verifier = async (numero, code) => {
  const ord = await OrdonnanceElectronique.findOne({
    where: { numero_unique: numero, code_verification: code },
    include: [
      {
        model: Medecin,
        as: 'medecin',
        attributes: ['nom', 'prenom', 'specialite', 'numero_ordre', 'fichier_cachet_id', 'fichier_signature_id'],
      },
      { model: Patient, as: 'patient', attributes: ['nom', 'prenom'] },
    ],
  });
  if (!ord) {
    const error = new Error('Ordonnance non trouvée ou code invalide');
    error.statusCode = 404;
    throw error;
  }
  if (ord.statut === STATUT_ORDONNANCE_ELEC.EXPIREE) {
    const error = new Error('Ordonnance expirée');
    error.statusCode = 410;
    throw error;
  }
  await auditLog.log(ord.id, 'verifiee', 'public', null, { numero, code });
  return formatOrdonnanceUrls(ord, ord.medecin);
};

const delivrer = async (ordonnanceId, acteurId, acteurType = 'pharmacie') => {
  const ord = await OrdonnanceElectronique.findByPk(ordonnanceId);
  if (!ord || ord.statut !== STATUT_ORDONNANCE_ELEC.SIGNEE) {
    const error = new Error('Ordonnance non délivrable');
    error.statusCode = 400;
    throw error;
  }
  ord.statut = STATUT_ORDONNANCE_ELEC.DELIVREE;
  await ord.save();
  await auditLog.log(ord.id, 'delivree', acteurType, acteurId);
  return ord;
};

const getAudit = async (ordonnanceId) => auditLog.lister(ordonnanceId);

module.exports = {
  creer,
  signer,
  listerMedecin,
  listerPatient,
  getDocument,
  verifier,
  delivrer,
  getAudit,
};
