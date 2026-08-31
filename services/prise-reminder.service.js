const { Op } = require('sequelize');
const { sequelize, PriseProgrammee, Traitement, Patient } = require('../models');
const smsService = require('./sms.service');
const emailService = require('./email.service');
const { STATUT_TRAITEMENT } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');
const crypto = require('crypto');

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const pad2 = (n) => String(n).padStart(2, '0');

const timeToMinutes = (t) => {
  if (!t) return null;
  const s = String(t).slice(0, 5);
  const [h, m] = s.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const alreadyReminded = async (priseId, patientId, dateStr, heure) => {
  const [rows] = await sequelize.query(
    `SELECT id FROM prise_rappels_envoyes
     WHERE prise_programmee_id = ? AND patient_id = ? AND date_rappel = ? AND heure_prise = ?
     LIMIT 1`,
    { replacements: [priseId, patientId, dateStr, heure] },
  );
  return rows.length > 0;
};

const markReminded = async (priseId, patientId, dateStr, heure, canal) => {
  await sequelize.query(
    `INSERT INTO prise_rappels_envoyes
      (id, prise_programmee_id, patient_id, date_rappel, heure_prise, canal, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    {
      replacements: [
        crypto.randomUUID(),
        priseId,
        patientId,
        dateStr,
        heure,
        canal,
      ],
    },
  );
};

const sendPriseReminders = async ({ windowMinutes = 8 } = {}) => {
  if (process.env.PRISE_REMINDER_ENABLED === 'false') {
    return { skipped: true };
  }

  const now = new Date();
  const jour = JOURS[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const dateStr = now.toISOString().slice(0, 10);

  const prises = await PriseProgrammee.findAll({
    where: {
      [Op.or]: [
        { jour_semaine: null },
        { jour_semaine: jour },
      ],
    },
    include: [{
      model: Traitement,
      as: 'traitement',
      required: true,
      where: { statut: STATUT_TRAITEMENT.ACTIF },
      include: [{
        model: Patient,
        as: 'patient',
        attributes: [
          'id', 'nom', 'prenom', 'telephone', 'email', 'preferences_notification',
        ],
      }],
    }],
  });

  let sentSms = 0;
  let sentEmail = 0;
  const errors = [];

  for (const prise of prises) {
    const cible = timeToMinutes(prise.heure_prise);
    if (cible == null) continue;
    const delta = Math.abs(cible - nowMin);
    const wrap = Math.min(delta, 1440 - delta);
    if (wrap > windowMinutes) continue;

    const traitement = prise.traitement;
    const patient = traitement?.patient;
    if (!patient) continue;

    const heureLabel = String(prise.heure_prise).slice(0, 5);
    if (await alreadyReminded(prise.id, patient.id, dateStr, heureLabel)) continue;

    const prefs = parseJsonField(patient.preferences_notification, {
      sms: true, email: false, push: true,
    });

    const med = traitement.nom_medicament;
    const dosage = traitement.dosage || '';
    const channels = [];

    if (prefs.sms !== false && patient.telephone) {
      const msg = `DjamSanté — Rappel : ${med}${dosage ? ` (${dosage})` : ''} à ${heureLabel}. Confirmez dans l'app.`;
      try {
        await smsService.sendSms(patient.telephone, msg);
        sentSms += 1;
        channels.push('sms');
      } catch (err) {
        errors.push({ priseId: prise.id, channel: 'sms', reason: err.message });
      }
    }

    if (prefs.email === true && patient.email) {
      try {
        await emailService.sendPriseReminderEmail({
          email: patient.email,
          prenom: patient.prenom,
          medicament: med,
          dosage,
          heure: heureLabel,
        });
        sentEmail += 1;
        channels.push('email');
      } catch (err) {
        errors.push({ priseId: prise.id, channel: 'email', reason: err.message });
      }
    }

    if (channels.length) {
      try {
        await markReminded(prise.id, patient.id, dateStr, heureLabel, channels.join('+'));
      } catch (err) {
        // doublon concurrent possible
        if (!/Duplicate/i.test(err.message)) {
          errors.push({ priseId: prise.id, reason: err.message });
        }
      }
    }
  }

  return {
    at: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
    sentSms,
    sentEmail,
    checked: prises.length,
    errors,
  };
};

module.exports = { sendPriseReminders };
