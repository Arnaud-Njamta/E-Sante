const ordonnanceService = require('../services/ordonnance-electronique.service');

const creer = async (req, res, next) => {
  try {
    const ord = await ordonnanceService.creer(req.medecin.id, req.body);
    res.status(201).json({ success: true, data: ord });
  } catch (error) {
    next(error);
  }
};

const signer = async (req, res, next) => {
  try {
    const ord = await ordonnanceService.signer(req.medecin.id, req.params.id);
    res.json({ success: true, data: ord, message: 'Ordonnance signée électroniquement' });
  } catch (error) {
    next(error);
  }
};

const listerMedecin = async (req, res, next) => {
  try {
    const ordonnances = await ordonnanceService.listerMedecin(req.medecin.id);
    res.json({ success: true, data: ordonnances });
  } catch (error) {
    next(error);
  }
};

const listerPatient = async (req, res, next) => {
  try {
    const ordonnances = await ordonnanceService.listerPatient(req.patient.id);
    res.json({ success: true, data: ordonnances });
  } catch (error) {
    next(error);
  }
};

const verifier = async (req, res, next) => {
  try {
    const ord = await ordonnanceService.verifier(req.params.numero, req.query.code);
    res.json({ success: true, data: ord });
  } catch (error) {
    next(error);
  }
};

const delivrer = async (req, res, next) => {
  try {
    const etab = req.etablissement || req.pharmacie || req.hopital || req.clinique;
    const ord = await ordonnanceService.delivrer(req.params.id, etab?.id, req.user.role);
    res.json({ success: true, data: ord, message: 'Ordonnance marquée comme délivrée' });
  } catch (error) {
    next(error);
  }
};

const getAudit = async (req, res, next) => {
  try {
    const logs = await ordonnanceService.getAudit(req.params.id);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const doc = await ordonnanceService.getDocument(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

const disponibilite = async (req, res, next) => {
  try {
    const reservationService = require('../services/reservation-dispensaire.service');
    const data = await reservationService.verifierDisponibiliteOrdonnance(
      req.patient.id,
      req.params.id,
      req.query.etablissement_id,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const reserver = async (req, res, next) => {
  try {
    const reservationService = require('../services/reservation-dispensaire.service');
    const data = await reservationService.creerDepuisOrdonnance(
      req.patient.id,
      req.params.id,
      req.body.etablissement_id,
      req.body,
    );
    res.status(201).json({ success: true, data, message: 'Réservation créée depuis l\'ordonnance' });
  } catch (error) {
    next(error);
  }
};

const telecharger = async (req, res, next) => {
  try {
    const html = await ordonnanceService.telechargerHtml(
      req.params.id,
      req.user.id,
      req.user.role,
    );
    const filename = `ordonnance-${req.params.id.slice(0, 8)}.html`;
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(html);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  creer, signer, listerMedecin, listerPatient, verifier, delivrer, disponibilite, reserver, getAudit, getDocument, telecharger,
};
