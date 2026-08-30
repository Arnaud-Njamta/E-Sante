const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commission.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');
const { patientAuth } = require('../middlewares/auth.middleware');

router.get('/tarifs', commissionController.getTarifs);
router.get('/preview/consultation', commissionController.previewConsultation);
router.post('/preview/pharmacie', patientAuth, commissionController.previewPharmacie);
router.get('/admin/resume', authMiddleware, requireRole('admin'), commissionController.resumeAdmin);
router.get('/admin/transactions', authMiddleware, requireRole('admin'), commissionController.listerTransactionsAdmin);
router.post('/admin/reversements/traiter', authMiddleware, requireRole('admin'), commissionController.traiterReversements);

module.exports = router;
