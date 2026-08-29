const medecinService = require('../services/medecin.service');

const lister = async (req, res, next) => {
  try {
    const result = await medecinService.lister(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const medecin = await medecinService.getById(req.params.id);
    res.json({ success: true, data: medecin });
  } catch (error) {
    next(error);
  }
};

module.exports = { lister, getById };
