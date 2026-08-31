const patientService = require('../services/patient.service');
const { saveFichier } = require('../services/fichier.service');
const { TYPE_FICHIER } = require('../utils/constants');
const { DPO_CONTACT, POLITIQUE_CONFIDENTIALITE_VERSION } = require('../config/privacy');

const getProfile = async (req, res, next) => {
  try {
    const patient = await patientService.getProfile(req.patient.id);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const patient = await patientService.updateProfile(req.patient.id, req.body);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const updateParametresVie = async (req, res, next) => {
  try {
    const patient = await patientService.updateParametresVie(req.patient.id, req.body);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const exportData = async (req, res, next) => {
  try {
    const data = await patientService.exportPatientData(req.patient.id);
    const filename = `medisante-export-${req.patient.id.slice(0, 8)}-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const result = await patientService.deletePatientAccount(req.patient.id, req.body);
    res.json({ success: true, data: result });
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
      proprietaire_type: 'patient',
      proprietaire_id: req.patient.id,
      type_fichier: TYPE_FICHIER.PHOTO_PROFIL,
    });
    const patient = await patientService.uploadPhoto(req.patient.id, meta);
    res.json({ success: true, data: { user: patient, patient } });
  } catch (error) {
    next(error);
  }
};

const getPrivacyInfo = async (req, res) => {
  res.json({
    success: true,
    data: {
      politique_version: POLITIQUE_CONFIDENTIALITE_VERSION,
      dpo: DPO_CONTACT,
      droits: [
        'Accès à vos données',
        'Rectification',
        'Effacement (droit à l\'oubli)',
        'Portabilité (export JSON)',
        'Opposition au partage pour la recherche',
      ],
    },
  });
};

module.exports = {
  getProfile,
  updateProfile,
  updateParametresVie,
  exportData,
  deleteAccount,
  uploadPhoto,
  getPrivacyInfo,
};
