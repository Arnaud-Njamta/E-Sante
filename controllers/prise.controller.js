const priseService = require('../services/prise.service');

const getPrisesAujourdhui = async (req, res, next) => {
  try {
    const prises = await priseService.getPrisesAujourdhui(req.patient.id);
    res.json({ success: true, data: prises });
  } catch (error) {
    next(error);
  }
};

const confirmerPrise = async (req, res, next) => {
  try {
    const historique = await priseService.confirmerPrise(req.params.id, req.patient.id, req.body);
    res.json({ success: true, data: historique });
  } catch (error) {
    next(error);
  }
};

const getHistorique = async (req, res, next) => {
  try {
    const historique = await priseService.getHistorique(req.patient.id, req.query);
    res.json({ success: true, data: historique });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrisesAujourdhui, confirmerPrise, getHistorique };
