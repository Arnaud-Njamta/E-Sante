const express = require('express');

const router = express.Router();

const ordController = require('../controllers/ordonnance-electronique.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const { requireRole } = require('../middlewares/auth.middleware');

const { ordonnanceVerifyLimiter } = require('../config/security');



router.post('/', authMiddleware, requireRole('medecin'), ordController.creer);

router.post('/:id/signer', authMiddleware, requireRole('medecin'), ordController.signer);

router.get('/medecin', authMiddleware, requireRole('medecin'), ordController.listerMedecin);

router.get('/patient', authMiddleware, requireRole('patient'), ordController.listerPatient);

router.get('/:id/disponibilite', authMiddleware, requireRole('patient'), ordController.disponibilite);

router.post('/:id/reserver', authMiddleware, requireRole('patient'), ordController.reserver);

router.get('/verifier/:numero', ordonnanceVerifyLimiter, ordController.verifier);

router.get('/:id/audit', authMiddleware, requireRole('medecin', 'pharmacie', 'hopital', 'clinique', 'admin'), ordController.getAudit);

router.post('/:id/delivrer', authMiddleware, requireRole('pharmacie', 'hopital', 'clinique'), ordController.delivrer);



module.exports = router;

