const demandeService = require('../services/demande-prise-en-charge.service');

const creer = async (req, res, next) => {
  try {
    const data = await demandeService.creer(req.patient.id, req.body);
    res.status(201).json({ success: true, data, message: 'Demande envoyée à l\'établissement' });
  } catch (err) {
    next(err);
  }
};

const listerPatient = async (req, res, next) => {
  try {
    const data = await demandeService.listerPatient(req.patient.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const annuler = async (req, res, next) => {
  try {
    const data = await demandeService.annulerPatient(req.patient.id, req.params.id);
    res.json({ success: true, data, message: 'Demande annulée' });
  } catch (err) {
    next(err);
  }
};

const getEtab = (req) => req.etablissement || req.pharmacie || req.hopital || req.clinique;

const listerEtablissement = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const data = await demandeService.listerEtablissement(etab.id, req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const repondre = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const data = await demandeService.repondre(etab.id, req.params.id, req.body);
    res.json({ success: true, data, message: 'Réponse envoyée au patient' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  creer, listerPatient, annuler, listerEtablissement, repondre,
};
