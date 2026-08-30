const structureMgmt = require('../services/structure-management.service');

const getEtab = (req) => req.etablissement || req.hopital || req.clinique;

const listMedecins = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const medecins = await structureMgmt.listMedecins(etab.id);
    res.json({ success: true, data: medecins });
  } catch (error) {
    next(error);
  }
};

const addMedecin = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const medecin = await structureMgmt.addMedecin(etab.id, req.body);
    res.status(201).json({ success: true, data: medecin });
  } catch (error) {
    next(error);
  }
};

const updateMedecin = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const medecin = await structureMgmt.updateMedecinStructure(etab.id, req.params.id, req.body);
    res.json({ success: true, data: medecin });
  } catch (error) {
    next(error);
  }
};

const listServices = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const services = await structureMgmt.listServices(etab.id);
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const service = await structureMgmt.createService(etab.id, req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const service = await structureMgmt.updateService(etab.id, req.params.id, req.body);
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const result = await structureMgmt.deleteService(etab.id, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const listRendezVous = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const rdv = await structureMgmt.listRendezVous(etab.id, req.query);
    res.json({ success: true, data: rdv });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMedecins,
  addMedecin,
  updateMedecin,
  listServices,
  createService,
  updateService,
  deleteService,
  listRendezVous,
};
