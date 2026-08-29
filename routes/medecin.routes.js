const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, medecinController.lister);
router.get('/:id', authMiddleware, medecinController.getById);

module.exports = router;
