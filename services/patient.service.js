const { Patient } = require('../models');

/**
 * Récupérer le profil du patient connecté
 */
const getProfile = async (patientId) => {
  const patient = await Patient.findByPk(patientId, {
    attributes: { exclude: ['password_hash'] },
  });

  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

/**
 * Mettre à jour le profil du patient
 */
const updateProfile = async (patientId, data) => {
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  await patient.update(data);

  const { password_hash, ...patientData } = patient.toJSON();
  return patientData;
};

/**
 * Mettre à jour les paramètres de vie (horaires réveil, coucher, repas)
 */
const updateParametresVie = async (patientId, data) => {
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (data.heure_reveil) updateData.heure_reveil = data.heure_reveil;
  if (data.heure_coucher) updateData.heure_coucher = data.heure_coucher;
  if (data.horaires_repas) {
    updateData.horaires_repas = {
      ...patient.horaires_repas,
      ...data.horaires_repas,
    };
  }

  await patient.update(updateData);

  const { password_hash, ...patientData } = patient.toJSON();
  return patientData;
};

module.exports = {
  getProfile,
  updateProfile,
  updateParametresVie,
};
