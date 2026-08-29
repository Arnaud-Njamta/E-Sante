const { Conversation, Message, Etablissement } = require('../models');
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

const demarrerConversation = async (patientId, pharmacieId, { sujet, message_initial }) => {
  const pharmacie = await Etablissement.findOne({
    where: { id: pharmacieId, type: TYPE_ETABLISSEMENT.PHARMACIE, actif: true, chat_actif: true },
  });

  if (!pharmacie) {
    const error = new Error('Pharmacie non trouvée ou chat non disponible');
    error.statusCode = 404;
    throw error;
  }

  let [conversation] = await Conversation.findOrCreate({
    where: { patient_id: patientId, pharmacie_id: pharmacieId },
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

const genererReponseAuto = (messagePatient, pharmacie) => {
  const msg = messagePatient.toLowerCase();
  const horaires = pharmacie.horaires_ouverture || {};

  if (msg.includes('ouvert') || msg.includes('horaire') || msg.includes('fermé')) {
    if (horaires.h24) {
      return `Bonjour ! ${pharmacie.nom} est ouverte 24h/24. Comment puis-je vous aider ?`;
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

  if (msg.includes('disponib') || msg.includes('stock') || msg.includes('avez') || msg.includes('trouv')) {
    return `Merci pour votre message. Nous vérifions la disponibilité de votre produit. Un pharmacien vous répondra sous peu. En attendant, pouvez-vous préciser le nom exact du médicament et le dosage ?`;
  }

  return `Bonjour et bienvenue chez ${pharmacie.nom} ! Nous avons bien reçu votre message. Un pharmacien vous répondra rapidement. Pour une demande de disponibilité, indiquez le nom du produit recherché.`;
};

const listerPharmaciesChat = async () => {
  return Etablissement.findAll({
    where: { type: TYPE_ETABLISSEMENT.PHARMACIE, actif: true, chat_actif: true },
    attributes: ['id', 'nom', 'ville', 'adresse', 'telephone', 'note_moyenne', 'horaires_ouverture'],
    order: [['nom', 'ASC']],
  });
};

module.exports = {
  listerConversations,
  demarrerConversation,
  getConversation,
  envoyerMessage,
  listerPharmaciesChat,
};
