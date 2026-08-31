const { Op } = require('sequelize');
const { RendezVous, Patient, Medecin } = require('../models');
const smsService = require('./sms.service');
const emailService = require('./email.service');
const { STATUT_RDV } = require('../utils/constants');
const { parseJsonField } = require('../utils/helpers');

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const formatDateFr = (dateStr) => {
  const [y, m, day] = dateStr.split('-');
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${parseInt(day, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
};

/**
 * Rappels RDV du lendemain — SMS et/ou e-mail selon préférences patient.
 */
const sendReminders = async () => {
  const dateRdv = getTomorrowDate();
  const emailEnabled = process.env.RDV_REMINDER_EMAIL !== 'false';
  const smsEnabled = process.env.RDV_REMINDER_SMS !== 'false';

  const rdvs = await RendezVous.findAll({
    where: {
      date_rdv: dateRdv,
      rappel_envoye: false,
      statut: { [Op.in]: [STATUT_RDV.EN_ATTENTE, STATUT_RDV.CONFIRME, STATUT_RDV.CONTRE_PROPOSITION] },
    },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: [
          'id', 'nom', 'prenom', 'telephone', 'email', 'preferences_notification',
        ],
      },
      { model: Medecin, as: 'medecin', attributes: ['id', 'nom', 'prenom', 'specialite'] },
    ],
  });

  let sentSms = 0;
  let sentEmail = 0;
  const errors = [];

  for (const rdv of rdvs) {
    const patient = rdv.patient;
    if (!patient) {
      errors.push({ rdvId: rdv.id, reason: 'Patient manquant' });
      continue;
    }

    const prefs = parseJsonField(patient.preferences_notification, {
      sms: true, email: true, push: true,
    });
    const dateLabel = formatDateFr(rdv.date_rdv);
    const medecinLabel = rdv.medecin
      ? `Dr ${rdv.medecin.prenom} ${rdv.medecin.nom} (${rdv.medecin.specialite || ''})`
      : '';

    let anySent = false;

    if (smsEnabled && prefs.sms !== false && patient.telephone) {
      const message = [
        'DjamSanté — Rappel RDV',
        `Demain ${dateLabel} à ${rdv.heure_debut}`,
        medecinLabel,
        'Consultez l\'app pour confirmer ou annuler.',
      ].filter(Boolean).join(' — ');
      try {
        await smsService.sendSms(patient.telephone, message);
        sentSms += 1;
        anySent = true;
      } catch (err) {
        errors.push({ rdvId: rdv.id, channel: 'sms', reason: err.message });
      }
    }

    if (emailEnabled && prefs.email !== false && patient.email) {
      try {
        await emailService.sendRdvReminderEmail({
          email: patient.email,
          prenom: patient.prenom,
          dateLabel,
          heure: rdv.heure_debut,
          medecinLabel,
        });
        sentEmail += 1;
        anySent = true;
      } catch (err) {
        errors.push({ rdvId: rdv.id, channel: 'email', reason: err.message });
      }
    }

    if (anySent || (!patient.telephone && !patient.email)) {
      rdv.rappel_envoye = true;
      await rdv.save();
    }
  }

  return {
    date: dateRdv,
    sentSms,
    sentEmail,
    sent: sentSms + sentEmail,
    total: rdvs.length,
    errors,
  };
};

module.exports = { sendReminders, getTomorrowDate };
