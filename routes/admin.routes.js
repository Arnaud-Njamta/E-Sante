const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminAuditController = require('../controllers/admin-audit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');

router.get('/overview', authMiddleware, requireRole('admin'), adminController.getOverview);
router.get('/comptes', authMiddleware, requireRole('admin'), adminController.listComptes);
router.get('/etablissements', authMiddleware, requireRole('admin'), adminController.listEtablissements);
router.get('/audit-logs', authMiddleware, requireRole('admin'), adminAuditController.lister);

module.exports = router;
