const ordonnanceService = require('../services/ordonnance.service');

const scanOrdonnance = async (req, res, next) => {
  try {
    const ordonnance = await ordonnanceService.scanOrdonnance(req.patient.id, req.file);
    res.status(201).json({ success: true, data: ordonnance });
  } catch (error) {
    next(error);
  }
};

const validerOrdonnance = async (req, res, next) => {
  try {
    const result = await ordonnanceService.validerOrdonnance(
      req.params.id,
      req.patient.id,
      req.patient,
      req.body,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const ordonnances = await ordonnanceService.getAll(req.patient.id);
    res.json({ success: true, data: ordonnances });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const ordonnance = await ordonnanceService.getById(req.params.id, req.patient.id);
    res.json({ success: true, data: ordonnance });
  } catch (error) {
    next(error);
  }
};

const listerPourPharmacie = async (req, res, next) => {
  try {
    const ordonnances = await ordonnanceService.listerPourPharmacie(req.patient.id);
    res.json({ success: true, data: ordonnances });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanOrdonnance, validerOrdonnance, getAll, getById, listerPourPharmacie,
};
