const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ordonnanceController = require('../controllers/ordonnance.controller');
const { patientAuth } = require('../middlewares/auth.middleware');
const { handleUpload } = require('../middlewares/upload.middleware');

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg').toLowerCase() || '.jpg';
    cb(null, `ordonnance-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadOrdonnance = multer({
  storage: diskStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/x-png', 'application/pdf'];
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (allowed.includes(file.mimetype) || ['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez JPG, PNG, WEBP ou PDF.'));
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: Ordonnances
 *   description: Scan et gestion des ordonnances
 */

/**
 * @swagger
 * /api/ordonnances/scan:
 *   post:
 *     summary: Scanner une ordonnance (upload image + OCR)
 *     tags: [Ordonnances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image de l'ordonnance (JPG, PNG, PDF)
 *     responses:
 *       201:
 *         description: Ordonnance scannée, données extraites
 *       400:
 *         description: Aucun fichier fourni
 */
router.post('/scan', patientAuth, handleUpload(uploadOrdonnance.single('image')), ordonnanceController.scanOrdonnance);

/**
 * @swagger
 * /api/ordonnances/{id}/valider:
 *   post:
 *     summary: Valider une ordonnance et créer les traitements
 *     tags: [Ordonnances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             description: Corrections manuelles des médicaments (optionnel)
 *             items:
 *               type: object
 *               properties:
 *                 nom:
 *                   type: string
 *                 dosage:
 *                   type: string
 *                 forme:
 *                   type: string
 *                 frequence:
 *                   type: string
 *                 instructions:
 *                   type: string
 *                 duree:
 *                   type: string
 *     responses:
 *       200:
 *         description: Ordonnance validée et traitements créés
 *       404:
 *         description: Ordonnance non trouvée
 */
router.post('/:id/valider', patientAuth, ordonnanceController.validerOrdonnance);

/**
 * @swagger
 * /api/ordonnances:
 *   get:
 *     summary: Liste des ordonnances du patient
 *     tags: [Ordonnances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des ordonnances
 */
router.get('/', patientAuth, ordonnanceController.getAll);
router.get('/pharmacie', patientAuth, ordonnanceController.listerPourPharmacie);
router.get('/:id', patientAuth, ordonnanceController.getById);

module.exports = router;
