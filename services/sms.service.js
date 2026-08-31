const { smsConfig, isMockMode } = require('../config/sms');

/**
 * Envoie un SMS (mock / sandbox Africa's Talking / live).
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
  const {
    apiKey, username, senderId, baseUrl, isSandbox,
  } = smsConfig.africasTalking;

  if (!apiKey || !username) {
    const error = new Error('SMS non configuré (clés Africa\'s Talking manquantes)');
    error.statusCode = 503;
    throw error;
  }

  // Format international avec +
  let to = String(telephone).trim();
  if (!to.startsWith('+')) {
    const digits = to.replace(/\D/g, '');
    to = digits.startsWith('237') ? `+${digits}` : `+237${digits}`;
  }

  const params = new URLSearchParams({
    username,
    to,
    message,
  });

  // En sandbox, le Sender ID alphanumérique n'est souvent pas activé
  const from = senderId || process.env.AFRICAS_TALKING_SENDER_ID;
  if (from && !isSandbox) {
    params.set('from', from);
  }

  const url = `${baseUrl}/version1/messaging`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  const body = await response.text();
  if (!response.ok) {
    console.error('[SMS] Africa\'s Talking error:', response.status, body.slice(0, 400));
    const error = new Error(
      response.status === 401
        ? 'Clé API Africa\'s Talking invalide — régénérez-la dans Settings → API Key'
        : 'Échec d\'envoi du SMS',
    );
    error.statusCode = response.status === 401 ? 401 : 502;
    throw error;
  }

  console.log(`[SMS] ${isSandbox ? 'sandbox' : 'live'} → ${to}`);
  return { success: true, mode: isSandbox ? 'sandbox' : 'live', telephone: to, raw: body.slice(0, 200) };
};

const sendOtpMessage = async (telephone, code, usageLabel) => {
  const message = `DjamSanté — Votre code ${usageLabel} : ${code}. Valide ${smsConfig.otpTtlMinutes} min. Ne le partagez pas.`;
  return sendSms(telephone, message);
};

module.exports = {
  sendSms,
  sendOtpMessage,
};
