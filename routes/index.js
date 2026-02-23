const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const traitementRoutes = require('./traitement.routes');
const priseRoutes = require('./prise.routes');
const ordonnanceRoutes = require('./ordonnance.routes');
const statistiqueRoutes = require('./statistique.routes');

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/traitements', traitementRoutes);
router.use('/prises', priseRoutes);
router.use('/ordonnances', ordonnanceRoutes);
router.use('/statistiques', statistiqueRoutes);

module.exports = router;
