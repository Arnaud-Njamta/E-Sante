const rendezvousService = require('../services/rendezvous.service');

const getCreneaux = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (req.user.role === 'medecin' && req.user.id !== req.params.medecinId) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const result = await rendezvousService.getCreneauxDisponibles(req.params.medecinId, date);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const creer = async (req, res, next) => {
  try {
    const rdv = await rendezvousService.creerRdv(req.patient.id, req.body);
    res.status(201).json({ success: true, data: rdv, message: 'Rendez-vous demandé — en attente de confirmation' });
  } catch (error) {
    next(error);
  }
};

const listerPatient = async (req, res, next) => {
  try {
    const result = await rendezvousService.listerPatient(req.patient.id, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const listerMedecin = async (req, res, next) => {
  try {
    const result = await rendezvousService.listerMedecin(req.medecin.id, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const mettreAJourStatut = async (req, res, next) => {
  try {
    const rdv = await rendezvousService.mettreAJourStatut(req.params.id, req.medecin.id, req.body);
    res.json({ success: true, data: rdv });
  } catch (error) {
    next(error);
  }
};

const proposerContreProposition = async (req, res, next) => {
  try {
    const rdv = await rendezvousService.proposerContreProposition(req.params.id, req.medecin.id, req.body);
    res.json({ success: true, data: rdv, message: 'Contre-proposition envoyée au patient' });
  } catch (error) {
    next(error);
  }
};

const repondreContreProposition = async (req, res, next) => {
  try {
    const rdv = await rendezvousService.repondreContreProposition(req.params.id, req.patient.id, req.body);
    res.json({
      success: true,
      data: rdv,
      message: req.body.accepter ? 'Nouveau créneau confirmé' : 'Contre-proposition refusée',
    });
  } catch (error) {
    next(error);
  }
};

const annuler = async (req, res, next) => {
  try {
    const rdv = await rendezvousService.annulerPatient(req.params.id, req.patient.id);
    res.json({ success: true, data: rdv });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const rdv = await rendezvousService.getById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: rdv });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCreneaux, creer, listerPatient, listerMedecin, mettreAJourStatut,
  proposerContreProposition, repondreContreProposition, annuler, getById,
};
