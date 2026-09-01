const qrMedicalService = require('../services/qr-medical.service');

const getMonQr = async (req, res, next) => {
  try {
    const data = await qrMedicalService.getMonQr(req.patient, req.familleProfil || null);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const regenerer = async (req, res, next) => {
  try {
    const data = await qrMedicalService.regenererToken(req.patient, req.familleProfil || null);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const lirePublic = async (req, res, next) => {
  try {
    const data = await qrMedicalService.lireParToken(req.params.token);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMonQr, regenerer, lirePublic };
