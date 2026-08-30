const express = require('express');
const router = express.Router();
const inscriptionController = require('../controllers/inscription.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');
const { uploadDocument } = require('../middlewares/upload.middleware');
const { validate, inscriptionStatutSchema } = require('../middlewares/validation.middleware');
const { inscriptionStatutLimiter } = require('../config/security');

router.get('/documents-requis', inscriptionController.getDocumentsRequis);
router.post(
  '/professionnel',
  uploadDocument.fields([
    { name: 'diplome', maxCount: 1 },
    { name: 'carte_ordre', maxCount: 1 },
    { name: 'agrement', maxCount: 1 },
    { name: 'autorisation', maxCount: 1 },
    { name: 'document', maxCount: 3 },
  ]),
  inscriptionController.registerProfessionnel,
);
router.post('/statut', inscriptionStatutLimiter, validate(inscriptionStatutSchema), inscriptionController.getStatut);
router.get('/admin/en-attente', authMiddleware, requireRole('admin'), inscriptionController.listerEnAttente);router.post('/admin/:id/valider', authMiddleware, requireRole('admin'), inscriptionController.valider);
router.post('/admin/:id/rejeter', authMiddleware, requireRole('admin'), inscriptionController.rejeter);

module.exports = router;
