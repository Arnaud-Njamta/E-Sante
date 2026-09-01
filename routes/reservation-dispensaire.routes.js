const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation-dispensaire.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

const dispensaireRoles = ['pharmacie', 'hopital', 'clinique'];

router.post('/estimer', authMiddleware, requireRole('patient'), reservationController.estimer);
router.post('/', authMiddleware, requireRole('patient'), reservationController.creer);
router.get('/mes-reservations', authMiddleware, requireRole('patient'), reservationController.listerPatient);
router.get('/:id/annulation-preview', authMiddleware, requireRole('patient'), reservationController.previewAnnulation);
router.delete('/:id', authMiddleware, requireRole('patient'), reservationController.annuler);

router.get('/etablissement', authMiddleware, requireRole(...dispensaireRoles), reservationController.listerEtablissement);
router.put('/:id/statut', authMiddleware, requireRole(...dispensaireRoles), reservationController.mettreAJourStatut);

module.exports = router;
