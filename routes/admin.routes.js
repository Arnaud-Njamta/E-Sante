const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminAuditController = require('../controllers/admin-audit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../middlewares/upload.middleware');

const noCache = (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

router.use(authMiddleware, requireRole('admin'), noCache);

router.get('/overview', adminController.getOverview);
router.get('/comptes', adminController.listComptes);
router.get('/etablissements', adminController.listEtablissements);
router.get('/audit-logs', adminAuditController.lister);
router.get('/alertes-sanitaires', adminController.listerAlertes);
router.post('/alertes-sanitaires', uploadImage.single('image'), adminController.creerAlerte);
router.get('/regions', adminController.getRegions);
router.get('/sante-publique', adminController.getSantePublique);

module.exports = router;
