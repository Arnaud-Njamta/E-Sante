const aiService = require('../services/ai-assistant.service');
const { parseJsonField } = require('../utils/helpers');

const buildContextFromRequest = (req) => {
  const ctx = { role: req.user?.role };
  const { latitude, longitude } = req.body || {};
  if (latitude != null && longitude != null) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      ctx.latitude = lat;
      ctx.longitude = lng;
      ctx.radius_km = 30;
    }
  }
  if (req.patient) {
    ctx.allergies = parseJsonField(req.patient.allergies, []);
    ctx.pathologies = parseJsonField(req.patient.pathologies, []);
    ctx.ville = req.patient.ville;
  }
  if (req.medecin) {
    ctx.medecinId = req.medecin.id;
    ctx.medecinName = `${req.medecin.prenom} ${req.medecin.nom}`;
    ctx.specialite = req.medecin.specialite;
    ctx.ville = req.medecin.etablissement?.ville;
  }
  return ctx;
};

const sendMessage = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const data = await aiService.chat({
      message,
      history,
      userContext: buildContextFromRequest(req),
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res) => {
  res.json({ success: true, data: aiService.healthCheck() });
};

const bookRdv = async (req, res, next) => {
  try {
    if (!req.patient) {
      const error = new Error('Réservé aux patients');
      error.statusCode = 403;
      throw error;
    }
    const { medecin_id, date_rdv, heure_debut, motif, type_consultation } = req.body;
    const data = await aiService.bookRdv(req.patient.id, {
      medecin_id,
      date_rdv,
      heure_debut,
      motif: motif || 'Consultation via assistant IA',
      type_consultation,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getStatus, bookRdv };
