const { Traitement, PriseProgrammee } = require('../models');
const horaireService = require('./horaire.service');

/**
 * Créer un traitement + générer les prises programmées
 */
const create = async (patientId, data, patient) => {
  const traitement = await Traitement.create({
    patient_id: patientId,
    nom_medicament: data.nom_medicament,
    dosage: data.dosage,
    forme: data.forme,
    frequence: data.frequence,
    instructions: data.instructions,
    date_debut: data.date_debut || new Date(),
    date_fin: data.date_fin,
  });

  // Générer les horaires de prise automatiquement
  let horaires = data.horaires_prise;
  if (!horaires || horaires.length === 0) {
    horaires = horaireService.genererHoraires(patient, data.frequence, data.instructions);
  }

  // Créer les prises programmées
  const prisesPromises = horaires.map((heure) =>
    PriseProgrammee.create({
      traitement_id: traitement.id,
      heure_prise: heure,
    })
  );
  await Promise.all(prisesPromises);

  // Retourner le traitement avec ses prises
  return getById(traitement.id, patientId);
};

/**
 * Récupérer tous les traitements d'un patient
 */
const getAll = async (patientId) => {
  return Traitement.findAll({
    where: { patient_id: patientId },
    include: [{ model: PriseProgrammee, as: 'prises_programmees' }],
    order: [['created_at', 'DESC']],
  });
};

/**
 * Récupérer un traitement par ID
 */
const getById = async (traitementId, patientId) => {
  const traitement = await Traitement.findOne({
    where: { id: traitementId, patient_id: patientId },
    include: [{ model: PriseProgrammee, as: 'prises_programmees' }],
  });

  if (!traitement) {
    const error = new Error('Traitement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  return traitement;
};

/**
 * Mettre à jour un traitement
 */
const update = async (traitementId, patientId, data) => {
  const traitement = await Traitement.findOne({
    where: { id: traitementId, patient_id: patientId },
  });

  if (!traitement) {
    const error = new Error('Traitement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  await traitement.update(data);

  // Si les horaires de prise sont modifiés, recréer les prises programmées
  if (data.horaires_prise) {
    await PriseProgrammee.destroy({ where: { traitement_id: traitementId } });
    const prisesPromises = data.horaires_prise.map((heure) =>
      PriseProgrammee.create({
        traitement_id: traitementId,
        heure_prise: heure,
      })
    );
    await Promise.all(prisesPromises);
  }

  return getById(traitementId, patientId);
};

/**
 * Changer le statut d'un traitement
 */
const updateStatut = async (traitementId, patientId, statut) => {
  const traitement = await Traitement.findOne({
    where: { id: traitementId, patient_id: patientId },
  });

  if (!traitement) {
    const error = new Error('Traitement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  await traitement.update({ statut });
  return traitement;
};

/**
 * Supprimer un traitement et ses prises programmées
 */
const remove = async (traitementId, patientId) => {
  const traitement = await Traitement.findOne({
    where: { id: traitementId, patient_id: patientId },
  });

  if (!traitement) {
    const error = new Error('Traitement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  await PriseProgrammee.destroy({ where: { traitement_id: traitementId } });
  await traitement.destroy();

  return { message: 'Traitement supprimé avec succès' };
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  updateStatut,
  remove,
};
