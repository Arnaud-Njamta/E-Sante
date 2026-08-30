const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiement.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

router.get('/config', paiementController.getConfig);
router.post('/cinetpay/notify', paiementController.notifyCinetPay);
router.post('/initier', authMiddleware, requireRole('patient'), paiementController.initier);
router.get('/mes-paiements', authMiddleware, requireRole('patient'), paiementController.lister);
router.get('/', authMiddleware, requireRole('patient'), paiementController.lister);
router.get('/:id/recu', authMiddleware, requireRole('patient'), paiementController.recu);
router.get('/:id/statut', authMiddleware, requireRole('patient'), paiementController.statut);
router.post('/:id/simuler', authMiddleware, requireRole('patient'), paiementController.simuler);

module.exports = router;
