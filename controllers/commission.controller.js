const commissionService = require('../services/commission.service');
const { Medecin } = require('../models');

const getTarifs = async (req, res) => {
  res.json({ success: true, data: commissionService.getTarifsPublics() });
};

const previewConsultation = async (req, res, next) => {
  try {
    const { medecin_id, tarif_fcfa } = req.query;
    let tarif = parseInt(tarif_fcfa, 10);
    if (!tarif && medecin_id) {
      const med = await Medecin.findByPk(medecin_id, { attributes: ['tarif_consultation_fcfa'] });
      tarif = med?.tarif_consultation_fcfa || 0;
    }
    res.json({
      success: true,
      data: commissionService.previewConsultation(tarif),
    });
  } catch (error) {
    next(error);
  }
};

const previewPharmacie = async (req, res, next) => {
  try {
    const { montant_brut_fcfa, lignes } = req.body;
    const data = lignes?.length
      ? commissionService.previewPharmacieLignes(lignes)
      : commissionService.previewPharmacie(montant_brut_fcfa);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const resumeAdmin = async (req, res, next) => {
  try {
    const data = await commissionService.resumeAdmin();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const listerTransactionsAdmin = async (req, res, next) => {
  try {
    const data = await commissionService.listerTransactionsAdmin(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const traiterReversements = async (req, res, next) => {
  try {
    const reversementService = require('../services/reversement.service');
    const data = await reversementService.traiterReversementsEnAttente();
    res.json({ success: true, data, message: `${data.reverses} reversement(s) effectué(s)` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTarifs,
  previewConsultation,
  previewPharmacie,
  resumeAdmin,
  listerTransactionsAdmin,
  traiterReversements,
};
