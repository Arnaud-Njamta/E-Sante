const adminService = require('../services/admin.service');

const getOverview = async (req, res, next) => {
  try {
    const data = await adminService.getOverview();
    res.json({ success: true, data });
  } catch (error) {
    console.error('[admin/overview]', error);
    next(error);
  }
};

const listComptes = async (req, res, next) => {
  try {
    const data = await adminService.listComptes(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const listEtablissements = async (req, res, next) => {
  try {
    const data = await adminService.listEtablissements(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  listComptes,
  listEtablissements,
};
