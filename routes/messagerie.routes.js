const express = require('express');
const router = express.Router();
const messagerieController = require('../controllers/messagerie.controller');
const { patientAuth, pharmacieAuth, structureAuth } = require('../middlewares/auth.middleware');
const { validate, messageSchema, conversationSchema } = require('../middlewares/validation.middleware');

router.get('/pharmacies', patientAuth, messagerieController.listerPharmacies);
router.get('/etablissements', patientAuth, messagerieController.listerPharmacies);
router.get('/conversations', patientAuth, messagerieController.listerConversations);
router.post(
  '/pharmacies/:pharmacieId/conversations',
  patientAuth,
  validate(conversationSchema),
  messagerieController.demarrerConversation,
);
router.post(
  '/etablissements/:etablissementId/conversations',
  patientAuth,
  validate(conversationSchema),
  messagerieController.demarrerConversationEtab,
);
router.get('/conversations/:id', patientAuth, messagerieController.getConversation);
router.post(
  '/conversations/:id/messages',
  patientAuth,
  validate(messageSchema),
  messagerieController.envoyerMessage,
);

router.get('/pharmacie/conversations', pharmacieAuth, messagerieController.listerConversationsPharmacie);
router.get('/pharmacie/conversations/:id', pharmacieAuth, messagerieController.getConversationPharmacie);
router.post(
  '/pharmacie/conversations/:id/messages',
  pharmacieAuth,
  validate(messageSchema),
  messagerieController.envoyerMessagePharmacie,
);

router.get('/structure/conversations', structureAuth, messagerieController.listerConversationsStructure);
router.get('/structure/conversations/:id', structureAuth, messagerieController.getConversationStructure);
router.post(
  '/structure/conversations/:id/messages',
  structureAuth,
  validate(messageSchema),
  messagerieController.envoyerMessageStructure,
);

module.exports = router;
