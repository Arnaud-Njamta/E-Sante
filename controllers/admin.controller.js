const adminService = require('../services/admin.service');
const adminAlerteService = require('../services/admin-alerte.service');
const santePubliqueService = require('../services/sante-publique.service');

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

const listerAlertes = async (_req, res, next) => {
  try {
    const data = await adminAlerteService.listerAlertes();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const creerAlerte = async (req, res, next) => {
  try {
    const payload = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const result = await adminAlerteService.creerAlerte(req.admin.id, payload, req.file);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getRegions = (_req, res) => {
  res.json({ success: true, data: adminAlerteService.CAMEROON_REGIONS });
};

const getSantePublique = async (_req, res, next) => {
  try {
    const data = await santePubliqueService.getSantePublique();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  listComptes,
  listEtablissements,
  listerAlertes,
  creerAlerte,
  getRegions,
  getSantePublique,
};
