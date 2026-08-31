const express = require('express');

const router = express.Router();

const fichierController = require('../controllers/fichier.controller');

const { optionalAuthMiddleware } = require('../middlewares/auth.middleware');

const fichierAccessMiddleware = require('../middlewares/fichier-access.middleware');



router.get('/:id', optionalAuthMiddleware, fichierAccessMiddleware, fichierController.getFichier);



module.exports = router;

