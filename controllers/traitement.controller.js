const traitementService = require('../services/traitement.service');

const create = async (req, res, next) => {
  try {
    const traitement = await traitementService.create(req.patient.id, req.body, req.patient);
    res.status(201).json({ success: true, data: traitement });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const traitements = await traitementService.getAll(req.patient.id);
    res.json({ success: true, data: traitements });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const traitement = await traitementService.getById(req.params.id, req.patient.id);
    res.json({ success: true, data: traitement });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const traitement = await traitementService.update(req.params.id, req.patient.id, req.body);
    res.json({ success: true, data: traitement });
  } catch (error) {
    next(error);
  }
};

const updateStatut = async (req, res, next) => {
  try {
    const traitement = await traitementService.updateStatut(req.params.id, req.patient.id, req.body.statut);
    res.json({ success: true, data: traitement });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await traitementService.remove(req.params.id, req.patient.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, update, updateStatut, remove };
