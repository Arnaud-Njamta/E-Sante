const express = require('express');
const router = express.Router();
const statistiqueController = require('../controllers/statistique.controller');
const { patientAuth } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Statistiques
 *   description: Statistiques d'observance et détection de non-observance
 */

/**
 * @swagger
 * /api/statistiques/observance:
 *   get:
 *     summary: Score d'observance global du patient
 *     tags: [Statistiques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jours
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Nombre de jours à analyser
 *     responses:
 *       200:
 *         description: Score d'observance avec détails
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: integer
 *                       description: Pourcentage d'observance
 *                       example: 85
 *                     total_prises:
 *                       type: integer
 *                     prises_confirmees:
 *                       type: integer
 *                     prises_oubliees:
 *                       type: integer
 *                     prises_retard:
 *                       type: integer
 *                     periode_jours:
 *                       type: integer
 */
router.get('/observance', patientAuth, statistiqueController.getScoreObservance);

/**
 * @swagger
 * /api/statistiques/tendances:
 *   get:
 *     summary: Tendances d'observance (hebdomadaire et mensuelle)
 *     tags: [Statistiques]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tendances hebdomadaires et mensuelles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     hebdomadaire:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           jour:
 *                             type: string
 *                           total:
 *                             type: integer
 *                           confirmees:
 *                             type: integer
 *                           score:
 *                             type: integer
 *                     mensuelle:
 *                       type: array
 */
router.get('/tendances', patientAuth, statistiqueController.getTendances);

/**
 * @swagger
 * /api/statistiques/risque:
 *   get:
 *     summary: Niveau de risque de non-observance
 *     tags: [Statistiques]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Niveau de risque avec actions recommandées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     score_observance:
 *                       type: integer
 *                     niveau:
 *                       type: string
 *                       enum: [faible, modere, eleve]
 *                     couleur:
 *                       type: string
 *                       enum: [vert, orange, rouge]
 *                     actions_recommandees:
 *                       type: array
 *                       items:
 *                         type: string
 *                     patterns_oubli:
 *                       type: object
 */
router.get('/risque', patientAuth, statistiqueController.getNiveauRisque);

module.exports = router;
