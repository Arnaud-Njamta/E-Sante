const messagerieService = require('../services/messagerie.service');

const getEtab = (req) => req.etablissement || req.pharmacie || req.hopital || req.clinique;

const demarrerConversationEtab = async (req, res, next) => {
  try {
    const etablissementId = req.params.etablissementId || req.params.pharmacieId;
    const conversation = await messagerieService.demarrerConversation(
      req.patient.id,
      etablissementId,
      req.body,
    );
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const listerPharmacies = async (req, res, next) => {
  try {
    const pharmacies = await messagerieService.listerPharmaciesChat();
    res.json({ success: true, data: pharmacies });
  } catch (error) {
    next(error);
  }
};

const listerConversations = async (req, res, next) => {
  try {
    const conversations = await messagerieService.listerConversations(req.patient.id);
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

const demarrerConversation = demarrerConversationEtab;

const getConversation = async (req, res, next) => {
  try {
    const conversation = await messagerieService.getConversation(
      req.params.id,
      req.patient.id,
    );
    res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const envoyerMessage = async (req, res, next) => {
  try {
    const conversation = await messagerieService.envoyerMessage(
      req.params.id,
      req.patient.id,
      req.body.contenu,
    );
    res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const listerConversationsPharmacie = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const conversations = await messagerieService.listerConversationsPharmacie(etab.id);
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

const getConversationPharmacie = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const conversation = await messagerieService.getConversationPharmacie(req.params.id, etab.id);
    res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const envoyerMessagePharmacie = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const conversation = await messagerieService.envoyerMessagePharmacie(
      req.params.id,
      etab.id,
      req.body.contenu,
    );
    res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const listerConversationsStructure = listerConversationsPharmacie;
const getConversationStructure = getConversationPharmacie;
const envoyerMessageStructure = envoyerMessagePharmacie;

module.exports = {
  listerPharmacies,
  listerConversations,
  demarrerConversation,
  demarrerConversationEtab,
  getConversation,
  envoyerMessage,
  listerConversationsPharmacie,
  getConversationPharmacie,
  envoyerMessagePharmacie,
  listerConversationsStructure,
  getConversationStructure,
  envoyerMessageStructure,
};
