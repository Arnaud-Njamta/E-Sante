const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const pushController = require('../controllers/push-notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/me', authMiddleware, notificationController.lister);
router.get('/push/vapid-public-key', pushController.getVapidPublicKey);
router.post('/push/subscribe', authMiddleware, pushController.subscribe);
router.post('/push/unsubscribe', authMiddleware, pushController.unsubscribe);

module.exports = router;
