const etablissementService = require('../services/etablissement.service');
const { saveFichier } = require('../services/fichier.service');
const { TYPE_FICHIER } = require('../utils/constants');

const getEtab = (req) => req.etablissement || req.pharmacie || req.hopital || req.clinique;

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

const getPublications = async (req, res, next) => {
  try {
    const publications = await etablissementService.getPublications(req.params.id);
    res.json({ success: true, data: publications });
  } catch (error) {
    next(error);
  }
};

const getPharmacieDashboard = async (req, res, next) => {
  try {
    const dashboard = await etablissementService.getPharmacieDashboard(req.pharmacie.id);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
};

const getStructureDashboard = async (req, res, next) => {
  try {
    const etab = req.etablissement || req.pharmacie || req.hopital || req.clinique;
    const dashboard = await etablissementService.getStructureDashboard(etab.id);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
};

const updateProfil = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const result = await etablissementService.updateProfil(etab.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateHoraires = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const horaires = await etablissementService.updateHoraires(etab.id, req.body);
    res.json({ success: true, data: horaires });
  } catch (error) {
    next(error);
  }
};

const updateGarde = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const result = await etablissementService.updateGarde(etab.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateLocalisation = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const loc = await etablissementService.updateLocalisation(etab.id, req.body);
    res.json({ success: true, data: loc });
  } catch (error) {
    next(error);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fichier photo requis' });
    }
    const etab = getEtab(req);
    const meta = await saveFichier({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      proprietaire_type: 'etablissement',
      proprietaire_id: etab.id,
      type_fichier: TYPE_FICHIER.PHOTO_PROFIL,
    });
    const result = await etablissementService.uploadPhoto(etab.id, meta);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  lister, getById, getHoraires, getPublications, getPharmacieDashboard, getStructureDashboard,
  updateProfil, updateHoraires, updateGarde, updateLocalisation, uploadPhoto,
};
