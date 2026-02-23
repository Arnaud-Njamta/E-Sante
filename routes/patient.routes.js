const express = require('express');
const router = express.Router();
const patientService = require('../services/patient.service');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate, updateProfileSchema, parametresVieSchema } = require('../middlewares/validation.middleware');

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Gestion du profil patient
 */

/**
 * @swagger
 * /api/patients/profile:
 *   get:
 *     summary: Récupérer le profil du patient connecté
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil du patient
 *       401:
 *         description: Non authentifié
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const patient = await patientService.getProfile(req.patient.id);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/patients/profile:
 *   put:
 *     summary: Modifier le profil du patient
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               date_naissance:
 *                 type: string
 *                 format: date
 *               telephone:
 *                 type: string
 *               contact_urgence:
 *                 type: string
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *               pathologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferences_notification:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.put('/profile', authMiddleware, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const patient = await patientService.updateProfile(req.patient.id, req.body);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/patients/parametres-vie:
 *   put:
 *     summary: Modifier les paramètres de vie (horaires)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heure_reveil:
 *                 type: string
 *                 example: "07:00"
 *               heure_coucher:
 *                 type: string
 *                 example: "23:00"
 *               horaires_repas:
 *                 type: object
 *                 properties:
 *                   petit_dejeuner:
 *                     type: string
 *                     example: "08:00"
 *                   dejeuner:
 *                     type: string
 *                     example: "12:30"
 *                   diner:
 *                     type: string
 *                     example: "19:30"
 *     responses:
 *       200:
 *         description: Paramètres mis à jour
 */
router.put('/parametres-vie', authMiddleware, validate(parametresVieSchema), async (req, res, next) => {
  try {
    const patient = await patientService.updateParametresVie(req.patient.id, req.body);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
