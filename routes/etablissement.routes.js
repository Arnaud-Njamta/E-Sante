const express = require('express');
const router = express.Router();
const etablissementController = require('../controllers/etablissement.controller');
const structureController = require('../controllers/structure.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');
const { uploadImage, handleUpload } = require('../middlewares/upload.middleware');

const structureRoles = ['pharmacie', 'hopital', 'clinique'];
const hopitalCliniqueRoles = ['hopital', 'clinique'];

router.get('/pharmacie/dashboard', authMiddleware, requireRole('pharmacie'), etablissementController.getPharmacieDashboard);
router.get('/structure/dashboard', authMiddleware, requireRole(...structureRoles), etablissementController.getStructureDashboard);
router.put('/me/profil', authMiddleware, requireRole(...structureRoles), etablissementController.updateProfil);
router.put('/me/horaires', authMiddleware, requireRole(...structureRoles), etablissementController.updateHoraires);
router.put('/me/localisation', authMiddleware, requireRole(...structureRoles), etablissementController.updateLocalisation);
router.post('/me/photo', authMiddleware, requireRole(...structureRoles), handleUpload(uploadImage.single('photo')), etablissementController.uploadPhoto);

router.get('/me/medecins', authMiddleware, requireRole(...hopitalCliniqueRoles), structureController.listMedecins);
router.post('/me/medecins', authMiddleware, requireRole(...hopitalCliniqueRoles), structureController.addMedecin);
router.put('/me/medecins/:id', authMiddleware, requireRole(...hopitalCliniqueRoles), structureController.updateMedecin);

router.get('/me/services', authMiddleware, requireRole(...hopitalCliniqueRoles), structureController.listServices);
router.post('/me/services', authMiddleware, requireRole(...hopitalCliniqueRoles), structureController.createService);
router.put('/me/services/:id', authMiddleware, requireRole(...hopitalCliniqueRoles), structureController.updateService);
router.delete('/me/services/:id', authMiddleware, requireRole(...hopitalCliniqueRoles), structureController.deleteService);

router.get('/me/rendez-vous', authMiddleware, requireRole(...hopitalCliniqueRoles), structureController.listRendezVous);

const profilProController = require('../controllers/profil-pro.controller');
router.post('/me/affiliations/inviter', authMiddleware, requireRole(...hopitalCliniqueRoles), profilProController.inviterMedecinStructure);
router.get('/me/affiliations', authMiddleware, requireRole(...hopitalCliniqueRoles), profilProController.listerAffiliationsStructure);
router.get('/me/equipe', authMiddleware, requireRole(...structureRoles), profilProController.listerMembresEquipe);
router.post('/me/equipe', authMiddleware, requireRole(...structureRoles), profilProController.creerMembreEquipe);
router.put('/me/equipe/:id', authMiddleware, requireRole(...structureRoles), profilProController.mettreAJourMembreEquipe);
router.delete('/me/equipe/:id', authMiddleware, requireRole(...structureRoles), profilProController.supprimerMembreEquipe);

const annuaireRoles = ['patient', 'medecin', 'admin', 'pharmacie', 'hopital', 'clinique'];

router.get('/', authMiddleware, requireRole(...annuaireRoles), etablissementController.lister);
router.get('/:id/equipe', authMiddleware, requireRole(...annuaireRoles), profilProController.listerMembresEquipePublic);
router.get('/:id', authMiddleware, requireRole(...annuaireRoles), etablissementController.getById);
router.get('/:id/publications', authMiddleware, requireRole(...annuaireRoles), etablissementController.getPublications);
router.get('/:id/horaires', authMiddleware, requireRole(...annuaireRoles), etablissementController.getHoraires);

module.exports = router;
