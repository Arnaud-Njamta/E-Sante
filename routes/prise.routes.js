const express = require('express');
const router = express.Router();
const priseController = require('../controllers/prise.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate, confirmerPriseSchema } = require('../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Prises
 *   description: Gestion des prises médicamenteuses
 */

/**
 * @swagger
 * /api/prises/aujourd-hui:
 *   get:
 *     summary: Prises du jour pour le patient connecté
 *     tags: [Prises]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des prises du jour avec statut
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       prise_programmee_id:
 *                         type: string
 *                       nom_medicament:
 *                         type: string
 *                       dosage:
 *                         type: string
 *                       heure_prevue:
 *                         type: string
 *                       statut:
 *                         type: string
 *                         enum: [en_attente, pris, oublie, retard, reporte]
 */
router.get('/aujourd-hui', authMiddleware, priseController.getPrisesAujourdhui);

/**
 * @swagger
 * /api/prises/{id}/confirmer:
 *   post:
 *     summary: Confirmer une prise (pris, oublié, reporté)
 *     tags: [Prises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la prise programmée
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
 *                 enum: [pris, oublie, reporte]
 *                 example: pris
 *               date_heure_reelle:
 *                 type: string
 *                 format: date-time
 *                 description: Optionnel - heure réelle de prise
 *     responses:
 *       200:
 *         description: Prise confirmée
 *       404:
 *         description: Prise programmée non trouvée
 */
router.post('/:id/confirmer', authMiddleware, validate(confirmerPriseSchema), priseController.confirmerPrise);

/**
 * @swagger
 * /api/prises/historique:
 *   get:
 *     summary: Historique des prises avec filtres
 *     tags: [Prises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_debut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: date_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 *       - in: query
 *         name: traitement_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par traitement
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Historique paginé des prises
 */
router.get('/historique', authMiddleware, priseController.getHistorique);

module.exports = router;
