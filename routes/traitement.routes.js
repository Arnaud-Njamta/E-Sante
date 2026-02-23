const express = require('express');
const router = express.Router();
const traitementService = require('../services/traitement.service');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate, traitementSchema } = require('../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Traitements
 *   description: Gestion des traitements médicamenteux
 */

/**
 * @swagger
 * /api/traitements:
 *   post:
 *     summary: Ajouter un traitement manuellement
 *     tags: [Traitements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom_medicament
 *             properties:
 *               nom_medicament:
 *                 type: string
 *                 example: Doliprane
 *               dosage:
 *                 type: string
 *                 example: 500mg
 *               forme:
 *                 type: string
 *                 enum: [comprime, gelule, sirop, injection, patch, gouttes, pommade, suppositoire, inhalateur, autre]
 *                 example: comprime
 *               frequence:
 *                 type: string
 *                 example: "3"
 *               instructions:
 *                 type: string
 *                 example: avec repas
 *               date_debut:
 *                 type: string
 *                 format: date
 *               date_fin:
 *                 type: string
 *                 format: date
 *               horaires_prise:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["08:00", "13:00", "20:00"]
 *     responses:
 *       201:
 *         description: Traitement créé avec prises programmées
 */
router.post('/', authMiddleware, validate(traitementSchema), async (req, res, next) => {
  try {
    const traitement = await traitementService.create(req.patient.id, req.body, req.patient);
    res.status(201).json({ success: true, data: traitement });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/traitements:
 *   get:
 *     summary: Liste des traitements du patient
 *     tags: [Traitements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des traitements avec prises programmées
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const traitements = await traitementService.getAll(req.patient.id);
    res.json({ success: true, data: traitements });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/traitements/{id}:
 *   get:
 *     summary: Détail d'un traitement
 *     tags: [Traitements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détail du traitement
 *       404:
 *         description: Traitement non trouvé
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const traitement = await traitementService.getById(req.params.id, req.patient.id);
    res.json({ success: true, data: traitement });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/traitements/{id}:
 *   put:
 *     summary: Modifier un traitement
 *     tags: [Traitements]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_medicament:
 *                 type: string
 *               dosage:
 *                 type: string
 *               instructions:
 *                 type: string
 *               horaires_prise:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Traitement mis à jour
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const traitement = await traitementService.update(req.params.id, req.patient.id, req.body);
    res.json({ success: true, data: traitement });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/traitements/{id}/statut:
 *   patch:
 *     summary: Changer le statut d'un traitement
 *     tags: [Traitements]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [actif, termine, arrete]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch('/:id/statut', authMiddleware, async (req, res, next) => {
  try {
    const traitement = await traitementService.updateStatut(req.params.id, req.patient.id, req.body.statut);
    res.json({ success: true, data: traitement });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/traitements/{id}:
 *   delete:
 *     summary: Supprimer un traitement
 *     tags: [Traitements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Traitement supprimé
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await traitementService.remove(req.params.id, req.patient.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
