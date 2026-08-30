const { smsConfig, isMockMode } = require('../config/sms');

/**
 * Envoie un SMS (mock en dev, Africa's Talking en prod).
 */
const sendSms = async (telephone, message) => {
  if (isMockMode()) {
    console.log(`[SMS MOCK] → ${telephone}: ${message}`);
    return { success: true, mode: 'mock', telephone };
  }

  if (smsConfig.provider === 'africas_talking') {
    return sendViaAfricasTalking(telephone, message);
  }

  const error = new Error('Fournisseur SMS non configuré');
  error.statusCode = 503;
  throw error;
};

const sendViaAfricasTalking = async (telephone, message) => {
  const { apiKey, username, senderId } = smsConfig.africasTalking;
  if (!apiKey || !username) {
    const error = new Error('SMS non configuré (clés Africa\'s Talking manquantes)');
    error.statusCode = 503;
    throw error;
  }

  const params = new URLSearchParams({
    username,
    to: telephone.replace(/^\+/, ''),
    message,
    from: senderId,
  });

  const response = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('[SMS] Africa\'s Talking error:', body);
    const error = new Error('Échec d\'envoi du SMS');
    error.statusCode = 502;
    throw error;
  }

  return { success: true, mode: 'live', telephone };
};

const sendOtpMessage = async (telephone, code, usageLabel) => {
  const message = `DjamSanté — Votre code ${usageLabel} : ${code}. Valide ${smsConfig.otpTtlMinutes} min. Ne le partagez pas.`;
  return sendSms(telephone, message);
};

module.exports = {
  sendSms,
  sendOtpMessage,
};
