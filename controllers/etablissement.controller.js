const etablissementService = require('../services/etablissement.service');

const lister = async (req, res, next) => {
  try {
    const result = await etablissementService.lister(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const etablissement = await etablissementService.getById(req.params.id);
    res.json({ success: true, data: etablissement });
  } catch (error) {
    next(error);
  }
};

const getHoraires = async (req, res, next) => {
  try {
    const horaires = await etablissementService.getHoraires(req.params.id);
    res.json({ success: true, data: horaires });
  } catch (error) {
    next(error);
  }
};

module.exports = { lister, getById, getHoraires };
