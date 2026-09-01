const crypto = require('crypto');
const { Patient, ProfilFamille } = require('../models');
const { parseJsonField } = require('../utils/helpers');

const persistQrToken = async (entity, token, Model) => {
  if (entity && typeof entity.update === 'function') {
    await entity.update({ qr_token: token });
  } else if (entity?.id) {
    await Model.update({ qr_token: token }, { where: { id: entity.id } });
    entity.qr_token = token;
  }
};

const ensureQrToken = async (entity, isFamille = false) => {
  if (entity.qr_token) return entity.qr_token;
  const token = crypto.randomBytes(24).toString('hex');
  const Model = isFamille ? ProfilFamille : Patient;
  await persistQrToken(entity, token, Model);
  return token;
};

const buildEmergencyPayload = (data) => ({
  nom: data.nom,
  prenom: data.prenom,
  groupe_sanguin: data.groupe_sanguin || null,
  allergies: parseJsonField(data.allergies, []),
  pathologies: parseJsonField(data.pathologies, []).slice(0, 5),
  contact_urgence: data.contact_urgence || null,
  date_naissance: data.date_naissance || null,
  updated_at: new Date().toISOString(),
});

const getMonQr = async (patient, familleProfil = null) => {
  if (familleProfil) {
    const token = await ensureQrToken(familleProfil, true);
    const baseUrl = process.env.FRONT_URL || process.env.APP_URL || 'http://localhost:5173';
    return {
      token,
      url: `${baseUrl}/qr/${token}`,
      api_url: `/api/qr-medical/${token}`,
      payload: buildEmergencyPayload(familleProfil),
      profil_type: 'famille',
      profil_id: familleProfil.id,
    };
  }

  const token = await ensureQrToken(patient);
  const baseUrl = process.env.FRONT_URL || process.env.APP_URL || 'http://localhost:5173';
  return {
    token,
    url: `${baseUrl}/qr/${token}`,
    api_url: `/api/qr-medical/${token}`,
    payload: buildEmergencyPayload(patient),
    profil_type: 'patient',
    profil_id: patient.id,
  };
};

const lireParToken = async (token) => {
  if (!token || token.length < 16) {
    const error = new Error('Token QR invalide');
    error.statusCode = 400;
    throw error;
  }

  let entity = await Patient.findOne({ where: { qr_token: token } });
  if (entity) {
    return {
      ...buildEmergencyPayload(entity),
      profil_type: 'patient',
      source: 'DjamSanté — QR médical',
    };
  }

  entity = await ProfilFamille.findOne({ where: { qr_token: token, actif: true } });
  if (entity) {
    return {
      ...buildEmergencyPayload(entity),
      profil_type: 'famille',
      relation: entity.relation,
      source: 'DjamSanté — QR médical (profil famille)',
    };
  }

  const error = new Error('QR médical non trouvé ou expiré');
  error.statusCode = 404;
  throw error;
};

const regenererToken = async (patient, familleProfil = null) => {
  const token = crypto.randomBytes(24).toString('hex');
  if (familleProfil) {
    await persistQrToken(familleProfil, token, ProfilFamille);
  } else {
    await persistQrToken(patient, token, Patient);
  }
  return getMonQr(patient, familleProfil);
};

module.exports = { getMonQr, lireParToken, regenererToken, buildEmergencyPayload };
