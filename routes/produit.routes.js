const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole, optionalAuthMiddleware } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../middlewares/upload.middleware');

const dispensaireRoles = ['pharmacie', 'hopital', 'clinique'];

router.get('/recherche', optionalAuthMiddleware, produitController.rechercher);
router.get('/etablissement/:etablissementId', authMiddleware, requireRole('patient', 'medecin'), produitController.listerPublic);
router.get('/pharmacie/:pharmacieId', authMiddleware, requireRole('patient', 'medecin'), produitController.listerPublic);
router.get('/mes-produits', authMiddleware, requireRole(...dispensaireRoles), produitController.listerPharmacie);
router.post('/', authMiddleware, requireRole(...dispensaireRoles), uploadImage.single('image'), produitController.creer);
router.put('/:id', authMiddleware, requireRole(...dispensaireRoles), uploadImage.single('image'), produitController.mettreAJour);
router.delete('/:id', authMiddleware, requireRole(...dispensaireRoles), produitController.supprimer);

module.exports = router;
