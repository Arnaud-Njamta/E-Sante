const { Op } = require('sequelize');
const { RendezVous, Patient, Medecin } = require('../models');
const smsService = require('./sms.service');
const { STATUT_RDV } = require('../utils/constants');

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
 * Envoie des SMS de rappel pour les RDV du lendemain.
 */
const sendReminders = async () => {
  const dateRdv = getTomorrowDate();

  const rdvs = await RendezVous.findAll({
    where: {
      date_rdv: dateRdv,
      rappel_envoye: false,
      statut: { [Op.in]: [STATUT_RDV.EN_ATTENTE, STATUT_RDV.CONFIRME, STATUT_RDV.CONTRE_PROPOSITION] },
    },
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenom', 'telephone'] },
      { model: Medecin, as: 'medecin', attributes: ['id', 'nom', 'prenom', 'specialite'] },
    ],
  });

  let sent = 0;
  const errors = [];

  for (const rdv of rdvs) {
    const tel = rdv.patient?.telephone;
    if (!tel) {
      errors.push({ rdvId: rdv.id, reason: 'Pas de téléphone patient' });
      continue;
    }

    const dateLabel = formatDateFr(rdv.date_rdv);
    const message = [
      'DjamSanté — Rappel RDV',
      `Demain ${dateLabel} à ${rdv.heure_debut}`,
      `Dr ${rdv.medecin.prenom} ${rdv.medecin.nom} (${rdv.medecin.specialite})`,
      'Consultez l\'app pour confirmer ou annuler.',
    ].join(' — ');

    try {
      await smsService.sendSms(tel, message);
      rdv.rappel_envoye = true;
      await rdv.save();
      sent += 1;
    } catch (err) {
      errors.push({ rdvId: rdv.id, reason: err.message });
    }
  }

  return { date: dateRdv, sent, total: rdvs.length, errors };
};

module.exports = { sendReminders, getTomorrowDate };
