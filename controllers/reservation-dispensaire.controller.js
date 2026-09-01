const reservationService = require('../services/reservation-dispensaire.service');

const estimer = async (req, res, next) => {
  try {
    const data = await reservationService.estimerPanier(req.body.lignes || []);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const creer = async (req, res, next) => {
  try {
    const data = await reservationService.creer(req.patient.id, req.body);
    res.status(201).json({ success: true, data, message: 'Demande de réservation envoyée' });
  } catch (error) {
    next(error);
  }
};

const listerPatient = async (req, res, next) => {
  try {
    const data = await reservationService.listerPatient(req.patient.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const annuler = async (req, res, next) => {
  try {
    const data = await reservationService.annulerPatient(req.patient.id, req.params.id);
    const msg = data.annulation?.refund_fcfa > 0
      ? `Réservation annulée — remboursement de ${data.annulation.refund_fcfa.toLocaleString('fr-FR')} FCFA prévu`
      : 'Réservation annulée';
    res.json({ success: true, data, message: msg });
  } catch (error) {
    next(error);
  }
};

const previewAnnulation = async (req, res, next) => {
  try {
    const data = await reservationService.previewAnnulationPatient(req.patient.id, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getEtab = (req) => req.etablissement || req.pharmacie || req.hopital || req.clinique;

const listerEtablissement = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const data = await reservationService.listerEtablissement(etab.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const mettreAJourStatut = async (req, res, next) => {
  try {
    const etab = getEtab(req);
    const data = await reservationService.mettreAJourStatut(etab.id, req.params.id, req.body);
    res.json({ success: true, data, message: 'Statut mis à jour' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  estimer, creer, listerPatient, annuler, previewAnnulation, listerEtablissement, mettreAJourStatut,
};
