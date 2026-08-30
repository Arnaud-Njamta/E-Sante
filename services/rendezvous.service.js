const { Op } = require('sequelize');
const { RendezVous, Patient, Medecin, Etablissement } = require('../models');
const { STATUT_RDV, JOURS_SEMAINE } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');
const commissionService = require('./commission.service');
const paiementService = require('./paiement.service');

const JOUR_INDEX = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };

const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const getJourSemaine = (dateStr) => {
  const d = new Date(`${dateStr}T12:00:00`);
  const map = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return map[d.getDay()];
};

const buildLienVideo = (rdvId) => {
  const domain = process.env.JITSI_DOMAIN || 'meet.jit.si';
  const room = `medisante-${String(rdvId).replace(/-/g, '').slice(0, 20)}`;
  return `https://${domain}/${room}`;
};

const getDisponibilites = (medecin) => parseJsonField(medecin.horaires_consultation, {});

const DEFAULT_HORAIRES_MEDECIN = {
  duree_creneau_minutes: 30,
  lundi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
  mardi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
  mercredi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
  jeudi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
  vendredi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '17:00' }] },
  samedi: { actif: false, creneaux: [] },
  dimanche: { actif: false, creneaux: [] },
};

const ensureMedecinHoraires = async (medecin) => {
  const horaires = getDisponibilites(medecin);
  const hasActiveDay = Object.keys(DEFAULT_HORAIRES_MEDECIN)
    .filter((k) => k !== 'duree_creneau_minutes')
    .some((jour) => horaires[jour]?.actif && horaires[jour]?.creneaux?.length);
  if (!hasActiveDay) {
    medecin.horaires_consultation = DEFAULT_HORAIRES_MEDECIN;
    await medecin.save();
    return DEFAULT_HORAIRES_MEDECIN;
  }
  return horaires;
};

const collectCreneauxPris = (rdvs, date) => {
  const heuresPrises = new Set();
  rdvs.forEach((r) => {
    const statutsActifs = [STATUT_RDV.EN_ATTENTE, STATUT_RDV.CONFIRME, STATUT_RDV.CONTRE_PROPOSITION];
    if (!statutsActifs.includes(r.statut)) return;
    if (r.date_rdv === date) heuresPrises.add(r.heure_debut);
    if (r.statut === STATUT_RDV.CONTRE_PROPOSITION && r.date_proposee === date && r.heure_debut_proposee) {
      heuresPrises.add(r.heure_debut_proposee);
    }
  });
  return heuresPrises;
};

const getCreneauxDisponibles = async (medecinId, date) => {
  const medecin = await Medecin.findByPk(medecinId);
  if (!medecin) {
    const error = new Error('Médecin non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const horaires = await ensureMedecinHoraires(medecin);
  const jour = getJourSemaine(date);
  const jourConfig = horaires[jour];

  if (!jourConfig?.actif || !jourConfig.creneaux?.length) {
    return { date, creneaux: [], duree: horaires.duree_creneau_minutes || 30 };
  }

  const duree = horaires.duree_creneau_minutes || 30;
  const creneaux = [];

  jourConfig.creneaux.forEach((plage) => {
    let start = timeToMinutes(plage.debut);
    const end = timeToMinutes(plage.fin);
    while (start + duree <= end) {
      const h = String(Math.floor(start / 60)).padStart(2, '0');
      const m = String(start % 60).padStart(2, '0');
      const hFin = String(Math.floor((start + duree) / 60)).padStart(2, '0');
      const mFin = String((start + duree) % 60).padStart(2, '0');
      creneaux.push({ debut: `${h}:${m}`, fin: `${hFin}:${mFin}` });
      start += duree;
    }
  });

  const pris = await RendezVous.findAll({
    where: {
      medecin_id: medecinId,
      [Op.or]: [
        { date_rdv: date, statut: { [Op.in]: [STATUT_RDV.EN_ATTENTE, STATUT_RDV.CONFIRME, STATUT_RDV.CONTRE_PROPOSITION] } },
        { statut: STATUT_RDV.CONTRE_PROPOSITION, date_proposee: date },
      ],
    },
    attributes: ['date_rdv', 'heure_debut', 'date_proposee', 'heure_debut_proposee', 'statut'],
  });

  const heuresPrises = collectCreneauxPris(pris, date);
  const disponibles = creneaux.filter((c) => !heuresPrises.has(c.debut));

  return {
    date,
    creneaux: disponibles,
    duree,
    tarif: medecin.tarif_consultation_fcfa,
    commission: commissionService.previewConsultation(medecin.tarif_consultation_fcfa),
  };
};

const creerRdv = async (patientId, { medecin_id, date_rdv, heure_debut, motif, type_consultation }) => {
  const medecin = await Medecin.findByPk(medecin_id);
  if (!medecin || !medecin.actif) {
    const error = new Error('Médecin non disponible');
    error.statusCode = 404;
    throw error;
  }

  const type = type_consultation || 'presentiel';
  if (type === 'teleconsultation' && !medecin.accepte_teleconsultation) {
    const error = new Error('Ce médecin n\'accepte pas la téléconsultation');
    error.statusCode = 400;
    throw error;
  }

  const { creneaux } = await getCreneauxDisponibles(medecin_id, date_rdv);
  const slot = creneaux.find((c) => c.debut === heure_debut);
  if (!slot) {
    const error = new Error('Créneau non disponible');
    error.statusCode = 409;
    throw error;
  }

  const existant = await RendezVous.findOne({
    where: { patient_id: patientId, medecin_id, date_rdv, heure_debut },
  });
  if (existant) {
    const error = new Error('Vous avez déjà un rendez-vous à cette heure');
    error.statusCode = 409;
    throw error;
  }

  const rdv = await RendezVous.create({
    patient_id: patientId,
    medecin_id,
    etablissement_id: medecin.etablissement_id,
    date_rdv,
    heure_debut: slot.debut,
    heure_fin: slot.fin,
    motif,
    type_consultation: type,
    statut: STATUT_RDV.EN_ATTENTE,
  });

  const transaction = await commissionService.creerTransactionConsultation({
    patientId,
    medecinId: medecin_id,
    rendezVousId: rdv.id,
    tarifFcfa: medecin.tarif_consultation_fcfa,
    libelle: `Consultation ${type === 'teleconsultation' ? 'téléconsultation' : 'présentiel'}`,
  });

  const json = rdv.toJSON();
  return {
    ...json,
    commission: commissionService.previewConsultation(medecin.tarif_consultation_fcfa),
    transaction_id: transaction.id,
    statut_paiement: transaction.statut_paiement,
  };
};
const listerPatient = async (patientId, { statut, page = 1, limit = 20 }) => {
  const where = { patient_id: patientId };
  if (statut) where.statut = statut;

  const offset = (page - 1) * limit;
  const { rows, count } = await RendezVous.findAndCountAll({
    where,
    include: [
      { model: Medecin, as: 'medecin', attributes: ['id', 'nom', 'prenom', 'specialite', 'fichier_photo_id'] },
      { model: Etablissement, as: 'etablissement', attributes: ['id', 'nom', 'ville', 'adresse'], required: false },
    ],
    order: [['date_rdv', 'DESC'], ['heure_debut', 'DESC']],
    limit,
    offset,
  });

  return {
    rendez_vous: await Promise.all(rows.map(async (rdv) => {
      const json = rdv.toJSON();
      const tx = await commissionService.getTransactionByReference('rendez_vous', rdv.id);
      return { ...json, transaction: paiementService.formatTransaction(tx) };
    })),
    pagination: { total: count, page, limit },
  };
};

const listerMedecin = async (medecinId, { statut, date, page = 1, limit = 50 }) => {
  const where = { medecin_id: medecinId };
  if (statut) where.statut = statut;
  if (date) where.date_rdv = date;

  const offset = (page - 1) * limit;
  const { rows, count } = await RendezVous.findAndCountAll({
    where,
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'telephone', 'email'] },
    ],
    order: [['date_rdv', 'ASC'], ['heure_debut', 'ASC']],
    limit,
    offset,
  });

  return { rendez_vous: rows, pagination: { total: count, page, limit } };
};

const mettreAJourStatut = async (rdvId, medecinId, { statut, notes_medecin }) => {
  const rdv = await RendezVous.findOne({ where: { id: rdvId, medecin_id: medecinId } });
  if (!rdv) {
    const error = new Error('Rendez-vous non trouvé');
    error.statusCode = 404;
    throw error;
  }

  if (statut === STATUT_RDV.CONFIRME && rdv.statut !== STATUT_RDV.EN_ATTENTE) {
    const error = new Error('Seules les demandes en attente peuvent être validées');
    error.statusCode = 400;
    throw error;
  }

  if (statut === STATUT_RDV.ANNULE && ![STATUT_RDV.EN_ATTENTE, STATUT_RDV.CONTRE_PROPOSITION].includes(rdv.statut)) {
    const error = new Error('Ce rendez-vous ne peut plus être refusé');
    error.statusCode = 400;
    throw error;
  }

  rdv.statut = statut;
  if (notes_medecin !== undefined) rdv.notes_medecin = notes_medecin;
  if (statut === STATUT_RDV.CONFIRME && rdv.type_consultation === 'teleconsultation' && !rdv.lien_video) {
    rdv.lien_video = buildLienVideo(rdv.id);
  }
  if (statut === STATUT_RDV.ANNULE) {
    await commissionService.annulerTransaction('rendez_vous', rdvId);
  }
  await rdv.save();
  return rdv;
};

const proposerContreProposition = async (rdvId, medecinId, {
  date_proposee, heure_debut_proposee, message_contre_proposition,
}) => {
  const rdv = await RendezVous.findOne({ where: { id: rdvId, medecin_id: medecinId } });
  if (!rdv) {
    const error = new Error('Rendez-vous non trouvé');
    error.statusCode = 404;
    throw error;
  }
  if (rdv.statut !== STATUT_RDV.EN_ATTENTE) {
    const error = new Error('Contre-proposition possible uniquement sur une demande en attente');
    error.statusCode = 400;
    throw error;
  }
  if (!date_proposee || !heure_debut_proposee) {
    const error = new Error('Date et heure proposées requises');
    error.statusCode = 400;
    throw error;
  }

  const { creneaux } = await getCreneauxDisponibles(medecinId, date_proposee);
  const slot = creneaux.find((c) => c.debut === heure_debut_proposee);
  if (!slot) {
    const error = new Error('Créneau proposé non disponible');
    error.statusCode = 409;
    throw error;
  }

  rdv.statut = STATUT_RDV.CONTRE_PROPOSITION;
  rdv.date_proposee = date_proposee;
  rdv.heure_debut_proposee = slot.debut;
  rdv.heure_fin_proposee = slot.fin;
  rdv.message_contre_proposition = message_contre_proposition || null;
  await rdv.save();
  return rdv;
};

const repondreContreProposition = async (rdvId, patientId, { accepter }) => {
  const rdv = await RendezVous.findOne({ where: { id: rdvId, patient_id: patientId } });
  if (!rdv) {
    const error = new Error('Rendez-vous non trouvé');
    error.statusCode = 404;
    throw error;
  }
  if (rdv.statut !== STATUT_RDV.CONTRE_PROPOSITION) {
    const error = new Error('Aucune contre-proposition en attente');
    error.statusCode = 400;
    throw error;
  }

  if (accepter) {
    rdv.date_rdv = rdv.date_proposee;
    rdv.heure_debut = rdv.heure_debut_proposee;
    rdv.heure_fin = rdv.heure_fin_proposee;
    rdv.statut = STATUT_RDV.CONFIRME;
    if (rdv.type_consultation === 'teleconsultation' && !rdv.lien_video) {
      rdv.lien_video = buildLienVideo(rdv.id);
    }
  } else {
    rdv.statut = STATUT_RDV.ANNULE;
    await commissionService.annulerTransaction('rendez_vous', rdvId);
  }

  rdv.date_proposee = null;
  rdv.heure_debut_proposee = null;
  rdv.heure_fin_proposee = null;
  await rdv.save();
  return rdv;
};

const getById = async (rdvId, userId, role) => {
  const where = { id: rdvId };
  if (role === 'patient') where.patient_id = userId;
  if (role === 'medecin') where.medecin_id = userId;

  const rdv = await RendezVous.findOne({
    where,
    include: [
      { model: Medecin, as: 'medecin', attributes: ['id', 'nom', 'prenom', 'specialite'] },
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom'] },
    ],
  });
  if (!rdv) {
    const error = new Error('Rendez-vous non trouvé');
    error.statusCode = 404;
    throw error;
  }
  return rdv;
};
const annulerPatient = async (rdvId, patientId) => {
  const rdv = await RendezVous.findOne({ where: { id: rdvId, patient_id: patientId } });
  if (!rdv) {
    const error = new Error('Rendez-vous non trouvé');
    error.statusCode = 404;
    throw error;
  }
  if (![STATUT_RDV.EN_ATTENTE, STATUT_RDV.CONFIRME, STATUT_RDV.CONTRE_PROPOSITION].includes(rdv.statut)) {
    const error = new Error('Ce rendez-vous ne peut plus être annulé');
    error.statusCode = 400;
    throw error;
  }
  rdv.statut = STATUT_RDV.ANNULE;
  await rdv.save();
  await commissionService.annulerTransaction('rendez_vous', rdvId);
  return rdv;
};

module.exports = {
  getCreneauxDisponibles,
  creerRdv,
  listerPatient,
  listerMedecin,
  mettreAJourStatut,
  proposerContreProposition,
  repondreContreProposition,
  annulerPatient,
  getById,
  DEFAULT_HORAIRES_MEDECIN,
};