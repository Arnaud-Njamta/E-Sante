const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ordonnanceController = require('../controllers/ordonnance.controller');
const { patientAuth } = require('../middlewares/auth.middleware');

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration Multer pour upload des ordonnances
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'ordonnance-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez JPG, PNG ou PDF.'));
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
router.post('/scan', patientAuth, upload.single('image'), ordonnanceController.scanOrdonnance);

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

module.exports = router;
