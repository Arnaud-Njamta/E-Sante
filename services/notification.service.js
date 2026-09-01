const { Op, Sequelize } = require('sequelize');
const {
  ReservationDispensaire, Conversation, Message, RendezVous, Etablissement, Patient, Medecin,
} = require('../models');
const { STATUT_RESERVATION, STATUT_RDV } = require('../utils/constants');
const { MemoryCache } = require('../utils/memory-cache');

const notifCache = new MemoryCache({
  ttlMs: parseInt(process.env.NOTIF_CACHE_TTL_MS || '30000', 10),
  maxSize: 8000,
});

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

const countUnreadByConversation = async (conversationIds, expediteurType) => {
  if (!conversationIds.length) return {};
  const rows = await Message.findAll({
    attributes: [
      'conversation_id',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'unread'],
    ],
    where: {
      conversation_id: { [Op.in]: conversationIds },
      expediteur_type: expediteurType,
      lu: false,
    },
    group: ['conversation_id'],
    raw: true,
  });
  return Object.fromEntries(rows.map((r) => [r.conversation_id, parseInt(r.unread, 10) || 0]));
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
    limit: 20,
  });
  const unreadMap = await countUnreadByConversation(
    conversations.map((c) => c.id),
    'pharmacie',
  );
  conversations.forEach((c) => {
    const unread = unreadMap[c.id] || 0;
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
  });

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
  const unreadMap = await countUnreadByConversation(
    conversations.map((c) => c.id),
    'patient',
  );
  conversations.forEach((c) => {
    const unread = unreadMap[c.id] || 0;
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
  });

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

const getMedecinNotifications = async (medecinId) => {
  const items = [];

  const enAttente = await RendezVous.findAll({
    where: { medecin_id: medecinId, statut: STATUT_RDV.EN_ATTENTE },
    include: [{ model: Patient, as: 'patient', attributes: ['prenom', 'nom'] }],
    order: [['createdAt', 'DESC']],
    limit: 8,
  });
  enAttente.forEach((r) => {
    items.push({
      id: `rdv-wait-${r.id}`,
      type: 'rendez_vous',
      title: 'Nouvelle demande RDV',
      message: `${r.patient?.prenom} ${r.patient?.nom} — ${r.date_rdv} ${r.heure_debut}`,
      link: '/medecin/rendez-vous',
      createdAt: r.updatedAt || r.createdAt,
    });
  });

  const confirmes = await RendezVous.findAll({
    where: { medecin_id: medecinId, statut: STATUT_RDV.CONFIRME },
    include: [{ model: Patient, as: 'patient', attributes: ['prenom', 'nom'] }],
    order: [['date_rdv', 'ASC']],
    limit: 5,
  });
  confirmes.forEach((r) => {
    items.push({
      id: `rdv-ok-${r.id}`,
      type: 'rendez_vous',
      title: 'RDV confirmé à venir',
      message: `${r.patient?.prenom} ${r.patient?.nom} — ${r.date_rdv} ${r.heure_debut}`,
      link: '/medecin/rendez-vous',
      createdAt: r.updatedAt,
    });
  });

  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);
};

const bustNotificationCache = (role, userId) => {
  notifCache.delete(`${role}:${userId}`);
};

const lister = async (userId, role) => {
  const cacheKey = `${role}:${userId}`;
  const cached = notifCache.get(cacheKey);
  if (cached) return cached;

  let items = [];
  if (role === 'patient') items = await getPatientNotifications(userId);
  else if (role === 'medecin') items = await getMedecinNotifications(userId);
  else if (['pharmacie', 'hopital', 'clinique'].includes(role)) {
    items = await getStructureNotifications(userId, role);
  }

  notifCache.set(cacheKey, items);
  return items;
};

module.exports = { lister, bustNotificationCache };
