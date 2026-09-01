const pushService = require('../services/push-notification.service');

const getVapidPublicKey = (_req, res) => {
  const key = pushService.getPublicKey();
  res.json({
    success: true,
    data: { publicKey: key, configured: !!key && pushService.isConfigured() },
  });
};

const subscribe = async (req, res, next) => {
  try {
    const result = await pushService.subscribe({
      userRole: req.user.role,
      userId: req.user.id,
      subscription: req.body.subscription,
      userAgent: req.headers['user-agent'],
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    const result = await pushService.unsubscribe(
      req.user.role,
      req.user.id,
      req.body.endpoint,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVapidPublicKey, subscribe, unsubscribe };
