const observanceService = require('../services/observance.service');

const getScoreObservance = async (req, res, next) => {
  try {
    const { jours } = req.query;
    const score = await observanceService.getScoreObservance(req.patient.id, { jours: parseInt(jours) || 30 });
    res.json({ success: true, data: score });
  } catch (error) {
    next(error);
  }
};

const getTendances = async (req, res, next) => {
  try {
    const tendances = await observanceService.getTendances(req.patient.id);
    res.json({ success: true, data: tendances });
  } catch (error) {
    next(error);
  }
};

const getNiveauRisque = async (req, res, next) => {
  try {
    const risque = await observanceService.getNiveauRisque(req.patient.id);
    res.json({ success: true, data: risque });
  } catch (error) {
    next(error);
  }
};

module.exports = { getScoreObservance, getTendances, getNiveauRisque };
