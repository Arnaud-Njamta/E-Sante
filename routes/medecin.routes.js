const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../middlewares/upload.middleware');

router.get('/', authMiddleware, requireRole('patient'), medecinController.lister);
router.get('/me/profile', authMiddleware, requireRole('medecin'), medecinController.getProfile);
router.get('/me/dashboard', authMiddleware, requireRole('medecin'), medecinController.getDashboard);
router.put('/me/profile', authMiddleware, requireRole('medecin'), medecinController.updateProfil);
router.put('/me/horaires', authMiddleware, requireRole('medecin'), medecinController.updateHoraires);
router.post('/me/photo', authMiddleware, requireRole('medecin'), uploadImage.single('photo'), medecinController.uploadPhoto);
router.post('/me/cachet', authMiddleware, requireRole('medecin'), uploadImage.single('cachet'), medecinController.uploadCachet);
router.get('/:id', authMiddleware, requireRole('patient', 'medecin'), medecinController.getById);

module.exports = router;
