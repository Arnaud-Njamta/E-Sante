const avisService = require('../services/avis.service');

const lister = async (req, res, next) => {
  try {
    const { cible_type, cible_id } = req.query;
    const result = await avisService.lister({ cible_type, cible_id, ...req.query });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const creer = async (req, res, next) => {
  try {
    const result = await avisService.creer(req.patient.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { lister, creer };
