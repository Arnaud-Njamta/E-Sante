const { Op } = require('sequelize');
const { Avis, Patient, Etablissement, Medecin } = require('../models');
const { TYPE_CIBLE_AVIS } = require('../utils/constants');

const recalculerNote = async (cibleType, cibleId) => {
  const avis = await Avis.findAll({
    where: { cible_type: cibleType, cible_id: cibleId },
    attributes: ['note'],
  });

  const nombreAvis = avis.length;
  const noteMoyenne = nombreAvis === 0
    ? 5.0
    : Math.round((avis.reduce((sum, a) => sum + a.note, 0) / nombreAvis) * 100) / 100;

  const Model = cibleType === TYPE_CIBLE_AVIS.ETABLISSEMENT ? Etablissement : Medecin;
  await Model.update(
    { note_moyenne: noteMoyenne, nombre_avis: nombreAvis },
    { where: { id: cibleId } },
  );

  return { note_moyenne: noteMoyenne, nombre_avis: nombreAvis };
};

const lister = async ({ cible_type, cible_id, page = 1, limit = 10 }) => {
  const where = { cible_type, cible_id };
  const offset = (page - 1) * limit;

  const { rows, count } = await Avis.findAndCountAll({
    where,
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'prenom', 'nom'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  return {
    avis: rows,
    pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
  };
};

const creer = async (patientId, { cible_type, cible_id, note, commentaire }) => {
  if (cible_type === TYPE_CIBLE_AVIS.ETABLISSEMENT) {
    const etab = await Etablissement.findByPk(cible_id);
    if (!etab) {
      const error = new Error('Établissement non trouvé');
      error.statusCode = 404;
      throw error;
    }
  } else {
    const medecin = await Medecin.findByPk(cible_id);
    if (!medecin) {
      const error = new Error('Médecin non trouvé');
      error.statusCode = 404;
      throw error;
    }
  }

  const existant = await Avis.findOne({
    where: { patient_id: patientId, cible_type, cible_id },
  });

  if (existant) {
    const error = new Error('Vous avez déjà laissé un avis');
    error.statusCode = 409;
    throw error;
  }

  const avis = await Avis.create({
    patient_id: patientId,
    cible_type,
    cible_id,
    note,
    commentaire,
  });

  const stats = await recalculerNote(cible_type, cible_id);

  return { avis, stats };
};

module.exports = { lister, creer, recalculerNote };
