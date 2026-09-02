const medecinService = require('../services/medecin.service');
const medecinServicesService = require('../services/medecin-services.service');
const { saveFichier } = require('../services/fichier.service');
const { TYPE_FICHIER } = require('../utils/constants');

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

const getProfile = async (req, res, next) => {
  try {
    const medecin = await medecinService.getProfile(req.medecin.id);
    res.json({ success: true, data: medecin });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await medecinService.getDashboard(req.medecin.id);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
};

const updateProfil = async (req, res, next) => {
  try {
    const medecin = await medecinService.updateProfil(req.medecin.id, req.body);
    res.json({ success: true, data: medecin });
  } catch (error) {
    next(error);
  }
};

const updateHoraires = async (req, res, next) => {
  try {
    const medecin = await medecinService.updateHoraires(req.medecin.id, req.body);
    res.json({ success: true, data: medecin });
  } catch (error) {
    next(error);
  }
};

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fichier photo requis' });
    }
    const meta = await saveFichier({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      proprietaire_type: 'medecin',
      proprietaire_id: req.medecin.id,
      type_fichier: TYPE_FICHIER.PHOTO_PROFIL,
    });
    const medecin = await medecinService.uploadPhoto(req.medecin.id, meta);
    res.json({ success: true, data: medecin });
  } catch (error) {
    next(error);
  }
};

const uploadCachet = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fichier cachet requis' });
    }
    const meta = await saveFichier({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      proprietaire_type: 'medecin',
      proprietaire_id: req.medecin.id,
      type_fichier: TYPE_FICHIER.CACHET,
    });
    const medecin = await medecinService.uploadCachet(req.medecin.id, meta);
    res.json({ success: true, data: medecin, message: 'Cachet électronique enregistré' });
  } catch (error) {
    next(error);
  }
};

const uploadSignature = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fichier signature requis' });
    }
    const meta = await saveFichier({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      proprietaire_type: 'medecin',
      proprietaire_id: req.medecin.id,
      type_fichier: TYPE_FICHIER.SIGNATURE,
    });
    const medecin = await medecinService.uploadSignature(req.medecin.id, meta);
    res.json({ success: true, data: medecin, message: 'Signature électronique enregistrée' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  lister, getById, getProfile, getDashboard,
  updateProfil, updateHoraires, uploadPhoto, uploadCachet, uploadSignature,
  listServices: async (req, res, next) => {
    try {
      const services = await medecinServicesService.listForMedecin(req.medecin.id);
      res.json({ success: true, data: services });
    } catch (error) {
      next(error);
    }
  },
  createService: async (req, res, next) => {
    try {
      const service = await medecinServicesService.create(req.medecin.id, req.body);
      res.status(201).json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  },
  updateService: async (req, res, next) => {
    try {
      const service = await medecinServicesService.update(req.medecin.id, req.params.id, req.body);
      res.json({ success: true, data: service });
    } catch (error) {
      next(error);
    }
  },
  deleteService: async (req, res, next) => {
    try {
      const result = await medecinServicesService.remove(req.medecin.id, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
