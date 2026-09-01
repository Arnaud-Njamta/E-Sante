const express = require('express');
const router = express.Router();
const familleController = require('../controllers/famille.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

router.use(authMiddleware, requireRole('patient'));

router.get('/', familleController.lister);
router.post('/', familleController.creer);
router.put('/:id', familleController.mettreAJour);
router.delete('/:id', familleController.supprimer);

module.exports = router;
