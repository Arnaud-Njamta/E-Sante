const crypto = require('crypto');
const { ProfilFamille } = require('../models');
const { parseJsonField } = require('../utils/helpers');

const RELATIONS = ['enfant', 'parent', 'conjoint', 'autre'];

const formatProfil = (row) => {
  const data = row.toJSON ? row.toJSON() : row;
  return {
    id: data.id,
    patient_id: data.patient_id,
    nom: data.nom,
    prenom: data.prenom,
    date_naissance: data.date_naissance,
    relation: data.relation,
    groupe_sanguin: data.groupe_sanguin || null,
    allergies: parseJsonField(data.allergies, []),
    pathologies: parseJsonField(data.pathologies, []),
    traitements_habituelles: parseJsonField(data.traitements_habituelles, []),
    vaccinations: parseJsonField(data.vaccinations, []),
    contact_urgence: data.contact_urgence || null,
    notes_medicales: data.notes_medicales || '',
    observations_carnet: parseJsonField(data.observations_carnet, []),
    actif: !!data.actif,
    created_at: data.createdAt,
  };
};

const lister = async (patientId) => {
  const rows = await ProfilFamille.findAll({
    where: { patient_id: patientId, actif: true },
    order: [['createdAt', 'ASC']],
  });
  return rows.map(formatProfil);
};

const creer = async (patientId, payload) => {
  const count = await ProfilFamille.count({ where: { patient_id: patientId, actif: true } });
  if (count >= 8) {
    const error = new Error('Maximum 8 profils famille atteint');
    error.statusCode = 400;
    throw error;
  }

  const profil = await ProfilFamille.create({
    patient_id: patientId,
    nom: payload.nom,
    prenom: payload.prenom,
    date_naissance: payload.date_naissance || null,
    relation: RELATIONS.includes(payload.relation) ? payload.relation : 'autre',
    groupe_sanguin: payload.groupe_sanguin || null,
    allergies: payload.allergies || [],
    pathologies: payload.pathologies || [],
    traitements_habituelles: payload.traitements_habituelles || [],
    vaccinations: payload.vaccinations || [],
    contact_urgence: payload.contact_urgence || null,
    notes_medicales: payload.notes_medicales || '',
    observations_carnet: payload.observations_carnet || [],
    qr_token: crypto.randomBytes(24).toString('hex'),
  });
  return formatProfil(profil);
};

const mettreAJour = async (patientId, profilId, payload) => {
  const profil = await ProfilFamille.findOne({
    where: { id: profilId, patient_id: patientId, actif: true },
  });
  if (!profil) {
    const error = new Error('Profil famille non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const allowed = {};
  const fields = [
    'nom', 'prenom', 'date_naissance', 'relation', 'groupe_sanguin',
    'allergies', 'pathologies', 'traitements_habituelles', 'vaccinations',
    'contact_urgence', 'notes_medicales', 'observations_carnet',
  ];
  fields.forEach((f) => {
    if (payload[f] !== undefined) allowed[f] = payload[f];
  });
  if (payload.relation && !RELATIONS.includes(payload.relation)) {
    delete allowed.relation;
  }

  await profil.update(allowed);
  return formatProfil(profil);
};

const supprimer = async (patientId, profilId) => {
  const profil = await ProfilFamille.findOne({
    where: { id: profilId, patient_id: patientId },
  });
  if (!profil) {
    const error = new Error('Profil famille non trouvé');
    error.statusCode = 404;
    throw error;
  }
  await profil.update({ actif: false });
  return { message: 'Profil supprimé' };
};

module.exports = {
  RELATIONS,
  lister,
  creer,
  mettreAJour,
  supprimer,
  formatProfil,
};
