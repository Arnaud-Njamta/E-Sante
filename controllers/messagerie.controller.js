const messagerieService = require('../services/messagerie.service');

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

const demarrerConversation = async (req, res, next) => {
  try {
    const conversation = await messagerieService.demarrerConversation(
      req.patient.id,
      req.params.pharmacieId,
      req.body,
    );
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

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

module.exports = {
  listerPharmacies,
  listerConversations,
  demarrerConversation,
  getConversation,
  envoyerMessage,
};
