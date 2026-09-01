const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demande-prise-en-charge.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

const structureRoles = ['pharmacie', 'hopital', 'clinique'];

router.post('/', authMiddleware, requireRole('patient'), demandeController.creer);
router.get('/mes-demandes', authMiddleware, requireRole('patient'), demandeController.listerPatient);
router.delete('/:id', authMiddleware, requireRole('patient'), demandeController.annuler);

router.get('/etablissement', authMiddleware, requireRole(...structureRoles), demandeController.listerEtablissement);
router.put('/:id/reponse', authMiddleware, requireRole(...structureRoles), demandeController.repondre);

module.exports = router;
