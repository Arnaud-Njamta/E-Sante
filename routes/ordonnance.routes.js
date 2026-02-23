const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ordonnanceService = require('../services/ordonnance.service');
const authMiddleware = require('../middlewares/auth.middleware');

// Configuration Multer pour upload des ordonnances
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
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
router.post('/scan', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const ordonnance = await ordonnanceService.scanOrdonnance(req.patient.id, req.file);
    res.status(201).json({ success: true, data: ordonnance });
  } catch (error) {
    next(error);
  }
});

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
router.post('/:id/valider', authMiddleware, async (req, res, next) => {
  try {
    const result = await ordonnanceService.validerOrdonnance(
      req.params.id,
      req.patient.id,
      req.patient,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

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
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const ordonnances = await ordonnanceService.getAll(req.patient.id);
    res.json({ success: true, data: ordonnances });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
