const jwt = require('jsonwebtoken');
const { Patient } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const patient = await Patient.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Patient non trouvé',
      });
    }

    req.patient = patient;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }
};

module.exports = authMiddleware;
