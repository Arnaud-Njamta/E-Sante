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

const creer = async (medecinId, { patient_id, rendez_vous_id, diagnostic, medicaments, instructions }) => {
  const patient = await Patient.findByPk(patient_id);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const medecin = await Medecin.findByPk(medecinId);
  if (!medecin?.fichier_cachet_id) {
    const error = new Error('Veuillez d\'abord charger votre cachet électronique');
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
    statut: STATUT_ORDONNANCE_ELEC.BROUILLON,
    date_expiration: expiration.toISOString().split('T')[0],
    code_verification: genererCodeVerification(),
  });
  await auditLog.log(ord.id, 'creee', 'medecin', medecinId, { numero: ord.numero_unique });
  return ord;
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
  ord.statut = STATUT_ORDONNANCE_ELEC.SIGNEE;
  await ord.save();
  await auditLog.log(ord.id, 'signee', 'medecin', medecinId);
  return ord;
};

const listerMedecin = async (medecinId) => OrdonnanceElectronique.findAll({
  where: { medecin_id: medecinId },
  include: [{ model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom'] }],
  order: [['createdAt', 'DESC']],
  limit: 50,
});

const listerPatient = async (patientId) => OrdonnanceElectronique.findAll({
  where: { patient_id: patientId, statut: STATUT_ORDONNANCE_ELEC.SIGNEE },
  include: [{ model: Medecin, as: 'medecin', attributes: ['id', 'nom', 'prenom', 'specialite'] }],
  order: [['createdAt', 'DESC']],
});

const verifier = async (numero, code) => {
  const ord = await OrdonnanceElectronique.findOne({
    where: { numero_unique: numero, code_verification: code },
    include: [
      { model: Medecin, as: 'medecin', attributes: ['nom', 'prenom', 'specialite', 'numero_ordre'] },
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
  return ord;
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
  verifier,
  delivrer,
  getAudit,
};
