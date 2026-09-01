const { DemandePriseEnCharge, Etablissement, ServiceEtablissement, Patient } = require('../models');

const genererNumero = () => `DPC-${Date.now().toString(36).toUpperCase()}`;

const chargerDemande = async (id) => DemandePriseEnCharge.findByPk(id, {
  include: [
    { model: Etablissement, as: 'etablissement', attributes: ['id', 'nom', 'type', 'ville', 'telephone', 'adresse'] },
    { model: ServiceEtablissement, as: 'service', attributes: ['id', 'nom', 'categorie', 'description'], required: false },
    { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'telephone', 'email'], required: false },
  ],
});

const creer = async (patientId, {
  etablissement_id, service_id, type_urgence, message_patient, date_souhaitee, priorite,
}) => {
  const etab = await Etablissement.findOne({ where: { id: etablissement_id, actif: true } });
  if (!etab) {
    const error = new Error('Établissement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  if (service_id) {
    const svc = await ServiceEtablissement.findOne({
      where: { id: service_id, etablissement_id, disponible: true },
    });
    if (!svc) {
      const error = new Error('Service non disponible');
      error.statusCode = 400;
      throw error;
    }
  }

  const demande = await DemandePriseEnCharge.create({
    numero_reference: genererNumero(),
    patient_id: patientId,
    etablissement_id,
    service_id: service_id || null,
    type_urgence: type_urgence || null,
    message_patient,
    date_souhaitee: date_souhaitee || null,
    priorite: priorite || (type_urgence ? 'urgent' : 'normal'),
    statut: 'en_attente',
  });

  return chargerDemande(demande.id);
};

const listerPatient = async (patientId) => {
  const rows = await DemandePriseEnCharge.findAll({
    where: { patient_id: patientId },
    include: [
      { model: Etablissement, as: 'etablissement', attributes: ['id', 'nom', 'type', 'ville', 'telephone'] },
      { model: ServiceEtablissement, as: 'service', attributes: ['id', 'nom', 'categorie'], required: false },
    ],
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  return rows;
};

const listerEtablissement = async (etablissementId, { statut } = {}) => {
  const where = { etablissement_id: etablissementId };
  if (statut) where.statut = statut;
  return DemandePriseEnCharge.findAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'telephone', 'email'] },
      { model: ServiceEtablissement, as: 'service', attributes: ['id', 'nom', 'categorie'], required: false },
    ],
    order: [['priorite', 'DESC'], ['createdAt', 'DESC']],
    limit: 100,
  });
};

const repondre = async (etablissementId, demandeId, { statut, reponse_etablissement, date_proposee, heure_proposee }) => {
  const demande = await DemandePriseEnCharge.findOne({
    where: { id: demandeId, etablissement_id: etablissementId },
  });
  if (!demande) {
    const error = new Error('Demande non trouvée');
    error.statusCode = 404;
    throw error;
  }
  if (!['confirmee', 'refusee'].includes(statut)) {
    const error = new Error('Statut invalide');
    error.statusCode = 400;
    throw error;
  }
  demande.statut = statut;
  if (reponse_etablissement) demande.reponse_etablissement = reponse_etablissement;
  if (date_proposee) demande.date_proposee = date_proposee;
  if (heure_proposee) demande.heure_proposee = heure_proposee;
  await demande.save();
  return chargerDemande(demande.id);
};

const annulerPatient = async (patientId, demandeId) => {
  const demande = await DemandePriseEnCharge.findOne({
    where: { id: demandeId, patient_id: patientId, statut: 'en_attente' },
  });
  if (!demande) {
    const error = new Error('Demande non annulable');
    error.statusCode = 400;
    throw error;
  }
  demande.statut = 'annulee';
  await demande.save();
  return demande;
};

module.exports = {
  creer, listerPatient, listerEtablissement, repondre, annulerPatient, chargerDemande,
};
