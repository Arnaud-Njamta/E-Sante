const express = require('express');
const router = express.Router();
const messagerieController = require('../controllers/messagerie.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate, messageSchema, conversationSchema } = require('../middlewares/validation.middleware');

router.get('/pharmacies', authMiddleware, messagerieController.listerPharmacies);
router.get('/conversations', authMiddleware, messagerieController.listerConversations);
router.post(
  '/pharmacies/:pharmacieId/conversations',
  authMiddleware,
  validate(conversationSchema),
  messagerieController.demarrerConversation,
);
router.get('/conversations/:id', authMiddleware, messagerieController.getConversation);
router.post(
  '/conversations/:id/messages',
  authMiddleware,
  validate(messageSchema),
  messagerieController.envoyerMessage,
);

module.exports = router;
