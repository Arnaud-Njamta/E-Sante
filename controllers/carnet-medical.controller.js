const carnetService = require('../services/carnet-medical.service');
const consentementService = require('../services/consentement.service');

const getMonCarnet = async (req, res, next) => {
  try {
    const carnet = await carnetService.getMonCarnet(req.patient.id);
    res.json({ success: true, data: carnet });
  } catch (error) {
    next(error);
  }
};

const updateMonCarnet = async (req, res, next) => {
  try {
    const carnet = await carnetService.mettreAJourMonCarnet(req.patient.id, req.body);
    if (req.body.activer_carnet && req.body.consentement_carnet) {
      await consentementService.enregistrer({
        patient_id: req.patient.id,
        type: consentementService.CONSENTEMENT_TYPES.CARNET_ACTIVATION,
        politique_version: req.body.politique_version,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });
    }
    res.json({ success: true, data: carnet });
  } catch (error) {
    next(error);
  }
};

const getCarnetPatient = async (req, res, next) => {
  try {
    const carnet = await carnetService.getCarnetPourMedecin(req.medecin.id, req.params.patientId);
    res.json({ success: true, data: carnet });
  } catch (error) {
    next(error);
  }
};

const updateCarnetPatient = async (req, res, next) => {
  try {
    const carnet = await carnetService.mettreAJourParMedecin(
      req.medecin.id,
      req.params.patientId,
      req.body,
    );
    res.json({ success: true, data: carnet });
  } catch (error) {
    next(error);
  }
};

const getTextes = async (_req, res) => {
  res.json({ success: true, data: consentementService.getTextesConsentement() });
};

const listerMesConsentements = async (req, res, next) => {
  try {
    const logs = await consentementService.listerPourPatient(req.patient.id);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonCarnet,
  updateMonCarnet,
  getCarnetPatient,
  updateCarnetPatient,
  getTextes,
  listerMesConsentements,
};
