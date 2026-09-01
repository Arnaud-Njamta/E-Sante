const webpush = require('web-push');
const { Op } = require('sequelize');
const { PushSubscription, Patient } = require('../models');

let vapidReady = false;

const initVapid = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@e-sante.sn';
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidReady = true;
  return true;
};

const isConfigured = () => {
  if (!vapidReady) return initVapid();
  return vapidReady;
};

const getPublicKey = () => process.env.VAPID_PUBLIC_KEY || null;

const subscribe = async ({ userRole, userId, subscription, userAgent }) => {
  if (!subscription?.endpoint || !subscription?.keys) {
    const error = new Error('Subscription push invalide');
    error.statusCode = 400;
    throw error;
  }

  const existing = await PushSubscription.findOne({ where: { endpoint: subscription.endpoint } });
  if (existing) {
    await existing.update({
      user_role: userRole,
      user_id: userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: userAgent || null,
    });
    return { subscribed: true, id: existing.id };
  }

  const row = await PushSubscription.create({
    user_role: userRole,
    user_id: userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    user_agent: userAgent || null,
  });
  return { subscribed: true, id: row.id };
};

const unsubscribe = async (userRole, userId, endpoint) => {
  await PushSubscription.destroy({
    where: { user_role: userRole, user_id: userId, endpoint },
  });
  return { unsubscribed: true };
};

const sendToSubscription = async (sub, payload) => {
  if (!isConfigured()) return false;
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
    );
    return true;
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await PushSubscription.destroy({ where: { id: sub.id } });
    }
    return false;
  }
};

const sendToUser = async (userRole, userId, payload) => {
  const subs = await PushSubscription.findAll({
    where: { user_role: userRole, user_id: userId },
  });
  const results = await Promise.all(subs.map((s) => sendToSubscription(s, payload)));
  return results.filter(Boolean).length;
};

const broadcastAlerteSanitaire = async (alerte) => {
  if (!isConfigured()) return { sent: 0 };

  const where = {};
  if (alerte.region) {
    where[Op.or] = [{ region: alerte.region }, { region: null }, { region: '' }];
  }

  const patients = await Patient.findAll({
    where,
    attributes: ['id'],
    limit: 5000,
  });

  const payload = {
    title: `🚨 ${alerte.titre}`,
    body: (alerte.contenu || '').slice(0, 180),
    url: '/actualites?type=alerte_sanitaire',
    type: 'alerte_sanitaire',
  };

  let sent = 0;
  for (const p of patients) {
    sent += await sendToUser('patient', p.id, payload);
  }
  return { sent };
};

module.exports = {
  isConfigured,
  getPublicKey,
  subscribe,
  unsubscribe,
  sendToUser,
  broadcastAlerteSanitaire,
};
