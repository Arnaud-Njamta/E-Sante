const { Op } = require('sequelize');
const { HistoriquePrise, PriseProgrammee, Traitement } = require('../models');
const { startOfDay, endOfDay } = require('../utils/helpers');
const { SEUIL_RETARD_MINUTES, STATUT_PRISE } = require('../utils/constants');

/**
 * Récupérer les prises du jour pour un patient
 */
const getPrisesAujourdhui = async (patientId) => {
  const today = new Date();
  const debut = startOfDay(today);
  const fin = endOfDay(today);

  // Récupérer les traitements actifs avec leurs prises programmées
  const traitements = await Traitement.findAll({
    where: {
      patient_id: patientId,
      statut: 'actif',
      date_debut: { [Op.lte]: today },
      [Op.or]: [
        { date_fin: null },
        { date_fin: { [Op.gte]: today } },
      ],
    },
    include: [{
      model: PriseProgrammee,
      as: 'prises_programmees',
    }],
  });

  // Construire la liste des prises du jour avec leur statut
  const prisesJour = [];

  for (const traitement of traitements) {
    for (const priseProgrammee of traitement.prises_programmees) {
      // Vérifier si une entrée historique existe déjà pour aujourd'hui
      const historique = await HistoriquePrise.findOne({
        where: {
          prise_programmee_id: priseProgrammee.id,
          patient_id: patientId,
          date_heure_prevue: { [Op.between]: [debut, fin] },
        },
      });

      prisesJour.push({
        prise_programmee_id: priseProgrammee.id,
        traitement_id: traitement.id,
        nom_medicament: traitement.nom_medicament,
        dosage: traitement.dosage,
        forme: traitement.forme,
        instructions: traitement.instructions,
        heure_prevue: priseProgrammee.heure_prise,
        statut: historique ? historique.statut : 'en_attente',
        historique_id: historique ? historique.id : null,
        date_heure_reelle: historique ? historique.date_heure_reelle : null,
      });
    }
  }

  // Trier par heure prévue
  prisesJour.sort((a, b) => a.heure_prevue.localeCompare(b.heure_prevue));

  return prisesJour;
};

/**
 * Confirmer une prise (pris, oublié, reporté)
 */
const confirmerPrise = async (priseId, patientId, { statut, date_heure_reelle }) => {
  const priseProgrammee = await PriseProgrammee.findByPk(priseId, {
    include: [{ model: Traitement, as: 'traitement' }],
  });

  if (!priseProgrammee) {
    const error = new Error('Prise programmée non trouvée');
    error.statusCode = 404;
    throw error;
  }

  if (priseProgrammee.traitement.patient_id !== patientId) {
    const error = new Error('Accès non autorisé');
    error.statusCode = 403;
    throw error;
  }

  const now = new Date();
  const heureReelle = date_heure_reelle ? new Date(date_heure_reelle) : now;

  // Calculer le retard en minutes
  const today = new Date();
  const [h, m] = priseProgrammee.heure_prise.split(':').map(Number);
  const heurePrevue = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m);
  const retardMinutes = statut === STATUT_PRISE.PRIS
    ? Math.max(0, Math.round((heureReelle - heurePrevue) / 60000))
    : 0;

  // Déterminer le statut final
  let statutFinal = statut;
  if (statut === STATUT_PRISE.PRIS && retardMinutes > SEUIL_RETARD_MINUTES) {
    statutFinal = STATUT_PRISE.RETARD;
  }

  // Vérifier si une entrée existe déjà pour aujourd'hui
  const debut = startOfDay(today);
  const fin = endOfDay(today);
  const existant = await HistoriquePrise.findOne({
    where: {
      prise_programmee_id: priseId,
      patient_id: patientId,
      date_heure_prevue: { [Op.between]: [debut, fin] },
    },
  });

  if (existant) {
    await existant.update({
      statut: statutFinal,
      date_heure_reelle: statut === STATUT_PRISE.OUBLIE ? null : heureReelle,
      retard_minutes: retardMinutes,
    });
    return existant;
  }

  // Créer une nouvelle entrée historique
  const historique = await HistoriquePrise.create({
    prise_programmee_id: priseId,
    patient_id: patientId,
    date_heure_prevue: heurePrevue,
    date_heure_reelle: statut === STATUT_PRISE.OUBLIE ? null : heureReelle,
    statut: statutFinal,
    retard_minutes: retardMinutes,
  });

  return historique;
};

/**
 * Récupérer l'historique des prises avec filtres
 */
const getHistorique = async (patientId, { date_debut, date_fin, traitement_id, page = 1, limit = 20 }) => {
  const where = { patient_id: patientId };

  if (date_debut && date_fin) {
    where.date_heure_prevue = {
      [Op.between]: [new Date(date_debut), endOfDay(new Date(date_fin))],
    };
  } else if (date_debut) {
    where.date_heure_prevue = { [Op.gte]: new Date(date_debut) };
  } else if (date_fin) {
    where.date_heure_prevue = { [Op.lte]: endOfDay(new Date(date_fin)) };
  }

  const include = [{
    model: PriseProgrammee,
    as: 'prise_programmee',
    include: [{
      model: Traitement,
      as: 'traitement',
      ...(traitement_id ? { where: { id: traitement_id } } : {}),
    }],
  }];

  const offset = (page - 1) * limit;

  const { count, rows } = await HistoriquePrise.findAndCountAll({
    where,
    include,
    order: [['date_heure_prevue', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    total: count,
    page: parseInt(page),
    total_pages: Math.ceil(count / limit),
    data: rows,
  };
};

module.exports = {
  getPrisesAujourdhui,
  confirmerPrise,
  getHistorique,
};
