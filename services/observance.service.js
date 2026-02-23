const { Op } = require('sequelize');
const { HistoriquePrise, PriseProgrammee, Traitement } = require('../models');
const { NIVEAU_RISQUE, STATUT_PRISE } = require('../utils/constants');
const { startOfDay, endOfDay } = require('../utils/helpers');

/**
 * Calculer le score d'observance global d'un patient
 * Score = (Prises confirmées / Prises attendues) × 100
 */
const getScoreObservance = async (patientId, { jours = 30 } = {}) => {
  const dateDebut = new Date();
  dateDebut.setDate(dateDebut.getDate() - jours);

  const historique = await HistoriquePrise.findAll({
    where: {
      patient_id: patientId,
      date_heure_prevue: { [Op.gte]: dateDebut },
    },
  });

  if (historique.length === 0) {
    return {
      score: 100,
      total_prises: 0,
      prises_confirmees: 0,
      prises_oubliees: 0,
      prises_retard: 0,
      periode_jours: jours,
    };
  }

  const prisesConfirmees = historique.filter(
    (h) => h.statut === STATUT_PRISE.PRIS || h.statut === STATUT_PRISE.RETARD
  ).length;
  const prisesOubliees = historique.filter((h) => h.statut === STATUT_PRISE.OUBLIE).length;
  const prisesRetard = historique.filter((h) => h.statut === STATUT_PRISE.RETARD).length;
  const score = Math.round((prisesConfirmees / historique.length) * 100);

  return {
    score,
    total_prises: historique.length,
    prises_confirmees: prisesConfirmees,
    prises_oubliees: prisesOubliees,
    prises_retard: prisesRetard,
    periode_jours: jours,
  };
};

/**
 * Calculer les tendances d'observance (hebdomadaire et mensuelle)
 */
const getTendances = async (patientId) => {
  const now = new Date();

  // Tendance sur les 7 derniers jours
  const tendanceHebdo = [];
  for (let i = 6; i >= 0; i--) {
    const jour = new Date(now);
    jour.setDate(jour.getDate() - i);
    const debut = startOfDay(jour);
    const fin = endOfDay(jour);

    const prises = await HistoriquePrise.findAll({
      where: {
        patient_id: patientId,
        date_heure_prevue: { [Op.between]: [debut, fin] },
      },
    });

    const total = prises.length;
    const confirmees = prises.filter(
      (p) => p.statut === STATUT_PRISE.PRIS || p.statut === STATUT_PRISE.RETARD
    ).length;

    tendanceHebdo.push({
      date: jour.toISOString().split('T')[0],
      jour: jour.toLocaleDateString('fr-FR', { weekday: 'short' }),
      total,
      confirmees,
      score: total > 0 ? Math.round((confirmees / total) * 100) : null,
    });
  }

  // Tendance sur les 4 dernières semaines
  const tendanceMensuelle = [];
  for (let i = 3; i >= 0; i--) {
    const finSemaine = new Date(now);
    finSemaine.setDate(finSemaine.getDate() - i * 7);
    const debutSemaine = new Date(finSemaine);
    debutSemaine.setDate(debutSemaine.getDate() - 6);

    const prises = await HistoriquePrise.findAll({
      where: {
        patient_id: patientId,
        date_heure_prevue: {
          [Op.between]: [startOfDay(debutSemaine), endOfDay(finSemaine)],
        },
      },
    });

    const total = prises.length;
    const confirmees = prises.filter(
      (p) => p.statut === STATUT_PRISE.PRIS || p.statut === STATUT_PRISE.RETARD
    ).length;

    tendanceMensuelle.push({
      semaine: `S-${i}`,
      date_debut: debutSemaine.toISOString().split('T')[0],
      date_fin: finSemaine.toISOString().split('T')[0],
      total,
      confirmees,
      score: total > 0 ? Math.round((confirmees / total) * 100) : null,
    });
  }

  return {
    hebdomadaire: tendanceHebdo,
    mensuelle: tendanceMensuelle,
  };
};

/**
 * Évaluer le niveau de risque de non-observance
 */
const getNiveauRisque = async (patientId) => {
  const { score } = await getScoreObservance(patientId, { jours: 14 });

  let niveau;
  let actions = [];

  if (score >= NIVEAU_RISQUE.FAIBLE.seuil_min) {
    niveau = NIVEAU_RISQUE.FAIBLE;
    actions = [
      'Continuez ainsi, votre observance est excellente !',
      'Maintien du suivi normal',
    ];
  } else if (score >= NIVEAU_RISQUE.MODERE.seuil_min) {
    niveau = NIVEAU_RISQUE.MODERE;
    actions = [
      'Votre observance a légèrement baissé',
      'Ajustement de la fréquence des rappels recommandé',
      'Pensez à vérifier vos horaires de prise',
    ];
  } else {
    niveau = NIVEAU_RISQUE.ELEVE;
    actions = [
      'Attention : votre observance est insuffisante',
      'Nous vous recommandons de contacter votre médecin',
      'Intensification des rappels activée',
      'Proposition de moments alternatifs de prise',
    ];
  }

  // Détecter les patterns d'oubli
  const patterns = await detecterPatternsOubli(patientId);

  return {
    score_observance: score,
    niveau: niveau.label,
    couleur: niveau.couleur,
    actions_recommandees: actions,
    patterns_oubli: patterns,
  };
};

/**
 * Détecter les patterns d'oubli (jours et moments les plus problématiques)
 */
const detecterPatternsOubli = async (patientId) => {
  const dateDebut = new Date();
  dateDebut.setDate(dateDebut.getDate() - 30);

  const oublis = await HistoriquePrise.findAll({
    where: {
      patient_id: patientId,
      statut: STATUT_PRISE.OUBLIE,
      date_heure_prevue: { [Op.gte]: dateDebut },
    },
  });

  // Compter les oublis par jour de la semaine
  const parJour = {};
  const parMoment = { matin: 0, midi: 0, soir: 0 };

  for (const oubli of oublis) {
    const date = new Date(oubli.date_heure_prevue);
    const jour = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    parJour[jour] = (parJour[jour] || 0) + 1;

    const heure = date.getHours();
    if (heure < 12) parMoment.matin++;
    else if (heure < 17) parMoment.midi++;
    else parMoment.soir++;
  }

  return {
    total_oublis_30j: oublis.length,
    par_jour: parJour,
    par_moment: parMoment,
  };
};

module.exports = {
  getScoreObservance,
  getTendances,
  getNiveauRisque,
};
