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
      'Accès refusé — le carnet n\'est accessible qu\'après validation du rendez-vous par le médecin, '
      + 'avec le consentement du patient.',
    );
    error.statusCode = 403;
    throw error;
  }
  return getMonCarnet(patientId);
};

const MEDECIN_EDIT_FIELDS = [
  'pathologies', 'traitements_habituelles', 'notes_medicales', 'vaccinations',
];

const mergeArrays = (existing, incoming) => {
  const base = Array.isArray(existing) ? existing : [];
  const add = Array.isArray(incoming) ? incoming : [];
  return [...new Set([...base, ...add.filter(Boolean)])];
};

const mettreAJourParMedecin = async (medecinId, patientId, payload) => {
  const consentementService = require('./consentement.service');
  const autorise = await consentementService.peutMedecinVoirCarnet(medecinId, patientId);
  if (!autorise) {
    const error = new Error('Accès refusé — validez d\'abord le rendez-vous pour modifier le carnet');
    error.statusCode = 403;
    throw error;
  }

  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const allowed = {};
  if (payload.pathologies) {
    allowed.pathologies = mergeArrays(parseJsonField(patient.pathologies, []), payload.pathologies);
  }
  if (payload.traitements_habituelles) {
    allowed.traitements_habituelles = mergeArrays(
      parseJsonField(patient.traitements_habituelles, []),
      payload.traitements_habituelles,
    );
  }
  if (payload.vaccinations) {
    allowed.vaccinations = mergeArrays(parseJsonField(patient.vaccinations, []), payload.vaccinations);
  }
  if (payload.notes_consultation) {
    const stamp = new Date().toLocaleDateString('fr-FR');
    const bloc = `[Consultation ${stamp}] ${payload.notes_consultation}`;
    const prev = patient.notes_medicales || '';
    allowed.notes_medicales = prev ? `${prev}\n\n${bloc}` : bloc;
  } else if (payload.notes_medicales !== undefined) {
    allowed.notes_medicales = payload.notes_medicales;
  }

  await patient.update(allowed);
  return formatCarnet(patient);
};

module.exports = {
  getMonCarnet,
  mettreAJourMonCarnet,
  getCarnetPourMedecin,
  mettreAJourParMedecin,
  formatCarnet,
};
