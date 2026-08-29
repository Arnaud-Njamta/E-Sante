const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const traitementRoutes = require('./traitement.routes');
const priseRoutes = require('./prise.routes');
const ordonnanceRoutes = require('./ordonnance.routes');
const statistiqueRoutes = require('./statistique.routes');
const etablissementRoutes = require('./etablissement.routes');
const medecinRoutes = require('./medecin.routes');
const avisRoutes = require('./avis.routes');
const messagerieRoutes = require('./messagerie.routes');

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/traitements', traitementRoutes);
router.use('/prises', priseRoutes);
router.use('/ordonnances', ordonnanceRoutes);
router.use('/statistiques', statistiqueRoutes);
router.use('/etablissements', etablissementRoutes);
router.use('/medecins', medecinRoutes);
router.use('/avis', avisRoutes);
router.use('/messagerie', messagerieRoutes);

module.exports = router;
