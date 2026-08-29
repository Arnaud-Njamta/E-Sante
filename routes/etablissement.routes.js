const express = require('express');
const router = express.Router();
const etablissementController = require('../controllers/etablissement.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, etablissementController.lister);
router.get('/:id', authMiddleware, etablissementController.getById);
router.get('/:id/horaires', authMiddleware, etablissementController.getHoraires);

module.exports = router;
