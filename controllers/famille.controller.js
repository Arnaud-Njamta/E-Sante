const familleService = require('../services/famille.service');

const lister = async (req, res, next) => {
  try {
    const profils = await familleService.lister(req.patient.id);
    res.json({ success: true, data: profils });
  } catch (error) {
    next(error);
  }
};

const creer = async (req, res, next) => {
  try {
    const profil = await familleService.creer(req.patient.id, req.body);
    res.status(201).json({ success: true, data: profil });
  } catch (error) {
    next(error);
  }
};

const mettreAJour = async (req, res, next) => {
  try {
    const profil = await familleService.mettreAJour(req.patient.id, req.params.id, req.body);
    res.json({ success: true, data: profil });
  } catch (error) {
    next(error);
  }
};

const supprimer = async (req, res, next) => {
  try {
    const result = await familleService.supprimer(req.patient.id, req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { lister, creer, mettreAJour, supprimer };
