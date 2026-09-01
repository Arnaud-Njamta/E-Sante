const express = require('express');
const router = express.Router();
const urgenceController = require('../controllers/urgence.controller');
const { optionalAuthMiddleware } = require('../middlewares/auth.middleware');

router.get('/types', optionalAuthMiddleware, urgenceController.listerTypes);
router.get('/protocole/:type', optionalAuthMiddleware, urgenceController.getProtocole);
router.get('/etablissements', optionalAuthMiddleware, urgenceController.trouverEtablissements);

module.exports = router;
