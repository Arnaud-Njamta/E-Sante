const { Patient } = require('../models');
const { parseJsonField } = require('../utils/helpers');

const CARNET_FIELDS = [
  'allergies', 'pathologies', 'groupe_sanguin',
  'antecedents_familiaux', 'antecedents_chirurgicaux',
  'traitements_habituelles', 'vaccinations', 'notes_medicales',
  'contact_urgence', 'date_naissance', 'consentement_carnet_at',
];

const formatCarnet = (patient) => {
  const data = patient.toJSON ? patient.toJSON() : patient;
  return {
    patient_id: data.id,
    nom: data.nom,
    prenom: data.prenom,
    date_naissance: data.date_naissance,
    groupe_sanguin: data.groupe_sanguin || null,
    allergies: parseJsonField(data.allergies, []),
    pathologies: parseJsonField(data.pathologies, []),
    antecedents_familiaux: parseJsonField(data.antecedents_familiaux, []),
    antecedents_chirurgicaux: parseJsonField(data.antecedents_chirurgicaux, []),
    traitements_habituelles: parseJsonField(data.traitements_habituelles, []),
    vaccinations: parseJsonField(data.vaccinations, []),
    notes_medicales: data.notes_medicales || '',
    contact_urgence: data.contact_urgence || null,
    actif: !!data.consentement_carnet_at,
    consentement_carnet_at: data.consentement_carnet_at,
    updated_at: data.updatedAt,
  };
};

const getMonCarnet = async (patientId) => {
  const patient = await Patient.findByPk(patientId, {
    attributes: ['id', 'nom', 'prenom', 'date_naissance', ...CARNET_FIELDS, 'updatedAt'],
  });
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }
  return formatCarnet(patient);
};

const mettreAJourMonCarnet = async (patientId, payload) => {
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const allowed = {};
  CARNET_FIELDS.forEach((f) => {
    if (payload[f] !== undefined) allowed[f] = payload[f];
  });

  if (payload.activer_carnet === true && !patient.consentement_carnet_at) {
    allowed.consentement_carnet_at = new Date();
  }

  await patient.update(allowed);
  return formatCarnet(patient);
};

const getCarnetPourMedecin = async (medecinId, patientId) => {
  const consentementService = require('./consentement.service');
  const autorise = await consentementService.peutMedecinVoirCarnet(medecinId, patientId);
  if (!autorise) {
    const error = new Error(
      'Accès refusé — le patient n\'a pas autorisé l\'accès à son carnet médical pour cette consultation. '
      + 'Conformément au secret médical et au RGPD, seules les données explicitement partagées sont accessibles.',
    );
    error.statusCode = 403;
    throw error;
  }
  return getMonCarnet(patientId);
};

module.exports = {
  getMonCarnet,
  mettreAJourMonCarnet,
  getCarnetPourMedecin,
  formatCarnet,
};
