const patientService = require('../services/patient.service');

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

module.exports = { getProfile, updateProfile, updateParametresVie };
