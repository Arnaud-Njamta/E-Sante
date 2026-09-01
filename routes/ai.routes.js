const express = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middlewares/auth.middleware');
const { optionalAuthMiddleware } = require('../middlewares/auth.middleware');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Limite de messages IA atteinte. Réessayez dans quelques minutes.' },
});

router.get('/status', optionalAuthMiddleware, aiController.getStatus);
router.post('/chat', authMiddleware, aiLimiter, aiController.sendMessage);
router.post('/book-rdv', authMiddleware, aiLimiter, aiController.bookRdv);

module.exports = router;
