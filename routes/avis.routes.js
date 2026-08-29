const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avis.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate, avisSchema } = require('../middlewares/validation.middleware');

router.get('/', authMiddleware, avisController.lister);
router.post('/', authMiddleware, validate(avisSchema), avisController.creer);

module.exports = router;
