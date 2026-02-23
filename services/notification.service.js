/**
 * Service de notifications
 *
 * NOTE: En production, intégrer Firebase Cloud Messaging (FCM) ici.
 * Pour le MVP, ce service simule l'envoi de notifications et log les actions.
 */

/**
 * Envoyer une notification push
 *
 * TODO: Intégrer FCM en production
 *   const admin = require('firebase-admin');
 *   admin.messaging().send({ token: deviceToken, notification: { title, body } });
 */
const envoyerNotification = async (patientId, { titre, message, type = 'rappel' }) => {
  console.log(`[NOTIFICATION] Patient: ${patientId} | Type: ${type} | ${titre}: ${message}`);

  return {
    success: true,
    patientId,
    titre,
    message,
    type,
    envoyee_a: new Date(),
  };
};

/**
 * Envoyer un rappel de prise
 */
const envoyerRappelPrise = async (patientId, medicament, heure) => {
  return envoyerNotification(patientId, {
    titre: 'Rappel de prise',
    message: `Il est l'heure de prendre ${medicament} (${heure})`,
    type: 'rappel',
  });
};

/**
 * Envoyer une relance en cas d'oubli
 */
const envoyerRelanceOubli = async (patientId, medicament) => {
  return envoyerNotification(patientId, {
    titre: 'Prise non confirmée',
    message: `Avez-vous pris ${medicament} ? Confirmez votre prise.`,
    type: 'relance',
  });
};

/**
 * Envoyer un message de motivation
 */
const envoyerMotivation = async (patientId, score) => {
  let message;
  if (score >= 85) {
    message = 'Bravo ! Votre observance est excellente cette semaine.';
  } else if (score >= 70) {
    message = 'Courage ! Vous pouvez améliorer votre observance. Chaque prise compte.';
  } else {
    message = 'Votre observance a baissé. N\'hésitez pas à contacter votre médecin si besoin.';
  }

  return envoyerNotification(patientId, {
    titre: 'Suivi d\'observance',
    message,
    type: 'motivation',
  });
};

module.exports = {
  envoyerNotification,
  envoyerRappelPrise,
  envoyerRelanceOubli,
  envoyerMotivation,
};
