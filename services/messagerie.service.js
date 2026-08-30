const { Op } = require('sequelize');
const { Conversation, Message, Etablissement, Patient } = require('../models');
const { TYPE_ETABLISSEMENT } = require('../utils/constants');

const listerConversations = async (patientId) => {
  return Conversation.findAll({
    where: { patient_id: patientId },
    include: [
      {
        model: Etablissement,
        as: 'pharmacie',
        attributes: ['id', 'nom', 'ville', 'telephone', 'chat_actif', 'note_moyenne'],
      },
      {
        model: Message,
        as: 'messages',
        limit: 1,
        order: [['createdAt', 'DESC']],
        separate: true,
      },
    ],
    order: [['dernier_message_at', 'DESC']],
  });
};

const demarrerConversation = async (patientId, etablissementId, { sujet, message_initial }) => {
  const etab = await Etablissement.findOne({
    where: {
      id: etablissementId,
      type: { [Op.in]: [TYPE_ETABLISSEMENT.PHARMACIE, TYPE_ETABLISSEMENT.HOPITAL, TYPE_ETABLISSEMENT.CLINIQUE] },
      actif: true,
      chat_actif: true,
    },
  });

  if (!etab) {
    const error = new Error('Établissement non trouvé ou messagerie non disponible');
    error.statusCode = 404;
    throw error;
  }

  let [conversation] = await Conversation.findOrCreate({
    where: { patient_id: patientId, pharmacie_id: etablissementId },
    defaults: {
      sujet: sujet || 'Demande de disponibilité',
      statut: 'ouverte',
      dernier_message_at: new Date(),
    },
  });

  if (message_initial) {
    await Message.create({
      conversation_id: conversation.id,
      expediteur_type: 'patient',
      contenu: message_initial,
    });
    await conversation.update({ dernier_message_at: new Date() });
  }

  return getConversation(conversation.id, patientId);
};

const getConversation = async (conversationId, patientId) => {
  const conversation = await Conversation.findOne({
    where: { id: conversationId, patient_id: patientId },
    include: [
      {
        model: Etablissement,
        as: 'pharmacie',
        attributes: ['id', 'nom', 'ville', 'telephone', 'horaires_ouverture', 'chat_actif'],
      },
      {
        model: Message,
        as: 'messages',
        order: [['createdAt', 'ASC']],
      },
    ],
  });

  if (!conversation) {
    const error = new Error('Conversation non trouvée');
    error.statusCode = 404;
    throw error;
  }

  return conversation;
};

const envoyerMessage = async (conversationId, patientId, contenu) => {
  const conversation = await Conversation.findOne({
    where: { id: conversationId, patient_id: patientId, statut: 'ouverte' },
    include: [{ model: Etablissement, as: 'pharmacie' }],
  });

  if (!conversation) {
    const error = new Error('Conversation non trouvée ou fermée');
    error.statusCode = 404;
    throw error;
  }

  const message = await Message.create({
    conversation_id: conversationId,
    expediteur_type: 'patient',
    contenu,
  });

  await conversation.update({ dernier_message_at: new Date() });

  // Réponse automatique simulée (en attendant l'IA / interface pharmacien)
  const reponseAuto = genererReponseAuto(contenu, conversation.pharmacie);
  if (reponseAuto) {
    await Message.create({
      conversation_id: conversationId,
      expediteur_type: 'pharmacie',
      contenu: reponseAuto,
    });
    await conversation.update({ dernier_message_at: new Date() });
  }

  return getConversation(conversationId, patientId);
};

const genererReponseAuto = (messagePatient, etablissement) => {
  const msg = messagePatient.toLowerCase();
  const horaires = etablissement.horaires_ouverture || {};
  const typeLabel = { pharmacie: 'pharmacie', hopital: 'hôpital', clinique: 'clinique' }[etablissement.type] || 'établissement';

  if (msg.includes('ouvert') || msg.includes('horaire') || msg.includes('fermé')) {
    if (horaires.h24) {
      return `Bonjour ! ${etablissement.nom} est ouvert 24h/24. Comment puis-je vous aider ?`;
    }
    const lignes = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
      .map((jour) => {
        const h = horaires[jour];
        if (!h?.ouvert) return `${jour}: fermé`;
        return `${jour}: ${h.debut} - ${h.fin}`;
      })
      .join('\n');
    return `Bonjour ! Voici nos horaires d'ouverture :\n${lignes}\n\nN'hésitez pas à préciser votre demande.`;
  }

  if (msg.includes('disponib') || msg.includes('stock') || msg.includes('avez') || msg.includes('trouv') || msg.includes('réserver')) {
    return `Merci pour votre message. Nous vérifions la disponibilité de votre produit au dispensaire. Un membre de notre équipe vous répondra sous peu. Vous pouvez aussi effectuer une réservation en ligne depuis notre fiche établissement.`;
  }

  return `Bonjour et bienvenue chez ${etablissement.nom} ! Nous avons bien reçu votre message. Notre ${typeLabel} vous répondra rapidement. Pour une demande de disponibilité, indiquez le nom exact du médicament et le dosage.`;
};

const listerPharmaciesChat = async () => {
  return Etablissement.findAll({
    where: {
      type: { [Op.in]: [TYPE_ETABLISSEMENT.PHARMACIE, TYPE_ETABLISSEMENT.HOPITAL, TYPE_ETABLISSEMENT.CLINIQUE] },
      actif: true,
      chat_actif: true,
    },
    attributes: ['id', 'nom', 'type', 'ville', 'adresse', 'telephone', 'note_moyenne', 'horaires_ouverture'],
    order: [['nom', 'ASC']],
  });
};

const listerConversationsPharmacie = async (pharmacieId) => {
  return Conversation.findAll({
    where: { pharmacie_id: pharmacieId },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'prenom', 'nom', 'email'],
      },
      {
        model: Message,
        as: 'messages',
        limit: 1,
        order: [['createdAt', 'DESC']],
        separate: true,
      },
    ],
    order: [['dernier_message_at', 'DESC']],
  });
};

const envoyerMessagePharmacie = async (conversationId, pharmacieId, contenu) => {
  const conversation = await Conversation.findOne({
    where: { id: conversationId, pharmacie_id: pharmacieId, statut: 'ouverte' },
  });

  if (!conversation) {
    const error = new Error('Conversation non trouvée ou fermée');
    error.statusCode = 404;
    throw error;
  }

  await Message.create({
    conversation_id: conversationId,
    expediteur_type: 'pharmacie',
    contenu,
  });

  await conversation.update({ dernier_message_at: new Date() });

  return Conversation.findByPk(conversationId, {
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'prenom', 'nom'] },
      { model: Message, as: 'messages', order: [['createdAt', 'ASC']] },
    ],
  });
};

const getConversationPharmacie = async (conversationId, pharmacieId) => {
  const conversation = await Conversation.findOne({
    where: { id: conversationId, pharmacie_id: pharmacieId },
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'prenom', 'nom'] },
      { model: Message, as: 'messages', order: [['createdAt', 'ASC']] },
    ],
  });

  if (!conversation) {
    const error = new Error('Conversation non trouvée');
    error.statusCode = 404;
    throw error;
  }

  await Message.update(
    { lu: true },
    { where: { conversation_id: conversationId, expediteur_type: 'patient', lu: false } },
  );

  return conversation;
};

const listerConversationsStructure = (etabId) => listerConversationsPharmacie(etabId);
const getConversationStructure = (convId, etabId) => getConversationPharmacie(convId, etabId);
const envoyerMessageStructure = (convId, etabId, contenu) => envoyerMessagePharmacie(convId, etabId, contenu);

module.exports = {
  listerConversations,
  demarrerConversation,
  getConversation,
  envoyerMessage,
  listerPharmaciesChat,
  listerConversationsPharmacie,
  envoyerMessagePharmacie,
  getConversationPharmacie,
  listerConversationsStructure,
  getConversationStructure,
  envoyerMessageStructure,
};
