const notificationService = require('../services/notification.service');

const lister = async (req, res, next) => {
  try {
    const items = await notificationService.lister(req.user.id, req.user.role);
    res.json({ success: true, data: { items, unread: items.length } });
  } catch (error) {
    next(error);
  }
};

module.exports = { lister };
