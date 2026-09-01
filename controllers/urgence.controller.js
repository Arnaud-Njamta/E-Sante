const urgenceService = require('../services/urgence.service');

const listerTypes = async (req, res) => {
  res.json({ success: true, data: urgenceService.listerTypes() });
};

const getProtocole = async (req, res) => {
  const data = urgenceService.getProtocoleByType(req.params.type);
  if (!data?.protocole) {
    return res.status(404).json({ success: false, message: 'Type d\'urgence inconnu' });
  }
  return res.json({ success: true, data });
};

const trouverEtablissements = async (req, res, next) => {
  try {
    const data = await urgenceService.trouverEtablissements(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { listerTypes, getProtocole, trouverEtablissements };
