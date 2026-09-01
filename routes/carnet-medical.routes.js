const express = require('express');
const router = express.Router();
const carnetController = require('../controllers/carnet-medical.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

router.get('/textes-consentement', carnetController.getTextes);

router.get('/me', authMiddleware, requireRole('patient'), carnetController.getMonCarnet);
router.put('/me', authMiddleware, requireRole('patient'), carnetController.updateMonCarnet);
router.get('/me/consentements', authMiddleware, requireRole('patient'), carnetController.listerMesConsentements);

module.exports = router;
