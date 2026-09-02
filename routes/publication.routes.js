const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../middlewares/upload.middleware');

const proRoles = ['medecin', 'pharmacie', 'hopital', 'clinique'];
const allRoles = ['patient', ...proRoles];

router.get('/featured', publicationController.listerFeatured);
router.get('/alertes', publicationController.optionalAuth, publicationController.listerAlertes);
router.get('/', publicationController.optionalAuth, publicationController.lister);
router.get('/:id', publicationController.optionalAuth, publicationController.getById);
router.post('/', authMiddleware, requireRole(...proRoles), uploadImage.single('image'), publicationController.creer);
router.post('/:id/like', authMiddleware, requireRole(...allRoles), publicationController.toggleLike);
router.get('/:id/comments', publicationController.getComments);
router.post('/:id/comments', authMiddleware, requireRole(...allRoles), publicationController.addComment);
router.delete('/:id', authMiddleware, requireRole(...proRoles), publicationController.supprimer);

module.exports = router;
