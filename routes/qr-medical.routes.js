const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr-medical.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');
const familleProfilMiddleware = require('../middlewares/famille-profil.middleware');

const patientAuth = [authMiddleware, requireRole('patient'), familleProfilMiddleware];

router.get('/me/qr', ...patientAuth, qrController.getMonQr);
router.post('/me/regenerer', ...patientAuth, qrController.regenerer);
router.get('/:token', qrController.lirePublic);

module.exports = router;
