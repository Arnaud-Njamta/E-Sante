const express = require('express');
const router = express.Router();
const traitementController = require('../controllers/traitement.controller');
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
router.post('/', authMiddleware, validate(traitementSchema), traitementController.create);

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
router.get('/', authMiddleware, traitementController.getAll);

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
router.get('/:id', authMiddleware, traitementController.getById);

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
router.put('/:id', authMiddleware, traitementController.update);

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
router.patch('/:id/statut', authMiddleware, traitementController.updateStatut);

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
router.delete('/:id', authMiddleware, traitementController.remove);

module.exports = router;
