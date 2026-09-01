const express = require('express');
const router = express.Router();
const carnetController = require('../controllers/carnet-medical.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');
const familleProfilMiddleware = require('../middlewares/famille-profil.middleware');

const patientAuth = [authMiddleware, requireRole('patient'), familleProfilMiddleware];

router.get('/textes-consentement', carnetController.getTextes);

router.get('/me', ...patientAuth, carnetController.getMonCarnet);
router.put('/me', ...patientAuth, carnetController.updateMonCarnet);
router.post('/me/observations', ...patientAuth, carnetController.ajouterObservation);
router.get('/me/consentements', ...patientAuth, carnetController.listerMesConsentements);

module.exports = router;
