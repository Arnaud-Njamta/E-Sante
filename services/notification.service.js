const { Op } = require('sequelize');
const {
  ReservationDispensaire, Conversation, Message, RendezVous, Etablissement, Patient,
} = require('../models');
const { STATUT_RESERVATION, STATUT_RDV } = require('../utils/constants');

const mapReservationNotif = (r) => {
  const labels = {
    confirmee: 'Réservation confirmée',
    refusee: 'Réservation refusée',
    prete: 'Médicaments prêts au retrait',
    retiree: 'Retrait effectué',
  };
  if (!labels[r.statut]) return null;
  return {
    id: `res-${r.id}-${r.statut}`,
    type: 'reservation',
    title: labels[r.statut],
    message: `${r.etablissement?.nom || 'Établissement'} — ${r.numero_reference}`,
    link: '/reservations',
    createdAt: r.updatedAt,
  };
};

const getPatientNotifications = async (patientId) => {
  const items = [];

  const reservations = await ReservationDispensaire.findAll({
    where: {
      patient_id: patientId,
      statut: { [Op.in]: ['confirmee', 'refusee', 'prete', 'retiree'] },
    },
    include: [{ model: Etablissement, as: 'etablissement', attributes: ['nom'] }],
    order: [['updatedAt', 'DESC']],
    limit: 8,
  });
  reservations.forEach((r) => {
    const n = mapReservationNotif(r);
    if (n) items.push(n);
  });

  const rdv = await RendezVous.findAll({
    where: { patient_id: patientId, statut: { [Op.in]: [STATUT_RDV.CONFIRME, STATUT_RDV.EN_ATTENTE] } },
    include: [{ model: Etablissement, as: 'etablissement', attributes: ['nom'], required: false }],
    order: [['date_rdv', 'ASC']],
    limit: 5,
  });
  rdv.forEach((r) => {
    items.push({
      id: `rdv-${r.id}`,
      type: 'rendez_vous',
      title: r.statut === STATUT_RDV.CONFIRME ? 'RDV confirmé' : 'RDV en attente',
      message: `${r.date_rdv} ${r.heure_debut} — ${r.etablissement?.nom || 'Consultation'}`,
      link: '/rendez-vous',
      createdAt: r.updatedAt,
    });
  });

  const conversations = await Conversation.findAll({
    where: { patient_id: patientId, statut: 'ouverte' },
    include: [{ model: Etablissement, as: 'pharmacie', attributes: ['nom'] }],
  });
  for (const c of conversations) {
    const unread = await Message.count({
      where: { conversation_id: c.id, expediteur_type: 'pharmacie', lu: false },
    });
    if (unread > 0) {
      items.push({
        id: `msg-${c.id}`,
        type: 'message',
        title: 'Nouveau message',
        message: `${c.pharmacie?.nom || 'Établissement'} — ${unread} message(s) non lu(s)`,
        link: `/pharmacie/chat/${c.id}`,
        createdAt: c.dernier_message_at || c.updatedAt,
      });
    }
  }

  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);
};

const getStructureNotifications = async (etablissementId, role) => {
  const items = [];
  const resaLink = role === 'hopital' ? '/hopital/reservations'
    : role === 'clinique' ? '/clinique/reservations' : '/pharmacie/reservations';
  const msgLinkBase = role === 'hopital' ? '/hopital/messages'
    : role === 'clinique' ? '/clinique/messages' : '/pharmacie/messages';
  const rdvLink = role === 'hopital' ? '/hopital/rendez-vous'
    : role === 'clinique' ? '/clinique/rendez-vous' : '/pharmacie/rendez-vous';

  const enAttente = await ReservationDispensaire.count({
    where: { etablissement_id: etablissementId, statut: STATUT_RESERVATION.EN_ATTENTE },
  });
  if (enAttente > 0) {
    items.push({
      id: `res-pending-${etablissementId}`,
      type: 'reservation',
      title: 'Réservations en attente',
      message: `${enAttente} demande(s) à traiter`,
      link: resaLink,
      createdAt: new Date(),
    });
  }

  const conversations = await Conversation.findAll({
    where: { pharmacie_id: etablissementId, statut: 'ouverte' },
    include: [{ model: Patient, as: 'patient', attributes: ['prenom', 'nom'] }],
    order: [['dernier_message_at', 'DESC']],
    limit: 10,
  });
  for (const c of conversations) {
    const unread = await Message.count({
      where: { conversation_id: c.id, expediteur_type: 'patient', lu: false },
    });
    if (unread > 0) {
      items.push({
        id: `msg-p-${c.id}`,
        type: 'message',
        title: 'Message patient',
        message: `${c.patient?.prenom} ${c.patient?.nom} — ${unread} non lu(s)`,
        link: `${msgLinkBase}/${c.id}`,
        createdAt: c.dernier_message_at || c.updatedAt,
      });
    }
  }

  const rdvCount = await RendezVous.count({
    where: { etablissement_id: etablissementId, statut: STATUT_RDV.EN_ATTENTE },
  });
  if (rdvCount > 0) {
    items.push({
      id: `rdv-pending-${etablissementId}`,
      type: 'rendez_vous',
      title: 'Rendez-vous en attente',
      message: `${rdvCount} RDV à confirmer`,
      link: rdvLink,
      createdAt: new Date(),
    });
  }

  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);
};

const lister = async (userId, role) => {
  if (role === 'patient') return getPatientNotifications(userId);
  if (['pharmacie', 'hopital', 'clinique'].includes(role)) {
    return getStructureNotifications(userId, role);
  }
  return [];
};

module.exports = { lister };
