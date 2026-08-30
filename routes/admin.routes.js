const express = require('express');
const router = express.Router();
const adminAuditController = require('../controllers/admin-audit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

router.get('/audit-logs', authMiddleware, requireRole('admin'), adminAuditController.lister);

module.exports = router;
