const paiementService = require('../services/paiement.service');
const { isCinetPayConfigured } = require('../config/cinetpay');

const getConfig = async (req, res) => {
  res.json({
    success: true,
    data: {
      cinetpay_actif: isCinetPayConfigured(),
      mode: isCinetPayConfigured() ? 'cinetpay' : 'simulation',
      operateurs: [
        { id: 'orange_money', label: 'Orange Money' },
        { id: 'mtn_momo', label: 'MTN MoMo' },
      ],
      devise: 'XAF',
    },
  });
};

const initier = async (req, res, next) => {
  try {
    const data = await paiementService.initierPaiement(req.patient.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const simuler = async (req, res, next) => {
  try {
    const data = await paiementService.simulerPaiement(req.patient.id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const statut = async (req, res, next) => {
  try {
    const data = await paiementService.getStatut(req.patient.id, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const lister = async (req, res, next) => {
  try {
    const rows = await paiementService.listerPatient(req.patient.id);
    const data = await Promise.all(rows.map((r) => paiementService.enrichirAvecBeneficiaire(r)));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const notifyCinetPay = async (req, res, next) => {
  try {
    await paiementService.traiterNotificationCinetPay(req.body);
    res.status(200).send('OK');
  } catch (error) {
    next(error);
  }
};

const recu = async (req, res, next) => {
  try {
    const { Transaction } = require('../models');
    const { genererRecuHtml } = require('../services/recu.service');
    const tx = await Transaction.findOne({
      where: { id: req.params.id, patient_id: req.patient.id, statut_paiement: 'paye' },
    });
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Reçu introuvable' });
    }
    const html = await genererRecuHtml(tx);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConfig, initier, simuler, statut, lister, notifyCinetPay, recu,
};
