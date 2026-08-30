const express = require('express');
const router = express.Router();
const rendezvousController = require('../controllers/rendezvous.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

router.get('/medecins/:medecinId/creneaux', authMiddleware, requireRole('patient', 'medecin'), rendezvousController.getCreneaux);
router.post('/', authMiddleware, requireRole('patient'), rendezvousController.creer);
router.get('/mes-rdv', authMiddleware, requireRole('patient'), rendezvousController.listerPatient);
router.get('/medecin', authMiddleware, requireRole('medecin'), rendezvousController.listerMedecin);
router.get('/:id', authMiddleware, requireRole('patient', 'medecin'), rendezvousController.getById);
router.delete('/:id', authMiddleware, requireRole('patient'), rendezvousController.annuler);
router.patch('/:id/statut', authMiddleware, requireRole('medecin'), rendezvousController.mettreAJourStatut);
router.post('/:id/contre-proposition', authMiddleware, requireRole('medecin'), rendezvousController.proposerContreProposition);
router.post('/:id/reponse-proposition', authMiddleware, requireRole('patient'), rendezvousController.repondreContreProposition);

module.exports = router;
