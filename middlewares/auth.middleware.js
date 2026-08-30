const jwt = require('jsonwebtoken');
const { Patient, Medecin, Etablissement, Admin } = require('../models');
const { USER_ROLES, TYPE_ETABLISSEMENT } = require('../utils/constants');

const attachEtablissement = (req, profile, role) => {
  req.etablissement = profile;
  if (role === USER_ROLES.PHARMACIE) req.pharmacie = profile;
  if (role === USER_ROLES.HOPITAL) req.hopital = profile;
  if (role === USER_ROLES.CLINIQUE) req.clinique = profile;
};

const authMiddleware = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization;

    if ((!authHeader || !authHeader.startsWith('Bearer ')) && req.query.access_token) {
      authHeader = `Bearer ${req.query.access_token}`;
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = decoded.role || USER_ROLES.PATIENT;

    let profile = null;

    if (role === USER_ROLES.ADMIN) {
      profile = await Admin.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] },
      });
      if (profile) req.admin = profile;
    } else if (role === USER_ROLES.PATIENT) {
      profile = await Patient.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] },
      });
      if (profile) req.patient = profile;
    } else if (role === USER_ROLES.MEDECIN) {
      profile = await Medecin.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] },
      });
      if (profile) req.medecin = profile;
    } else if ([USER_ROLES.PHARMACIE, USER_ROLES.HOPITAL, USER_ROLES.CLINIQUE].includes(role)) {
      const typeMap = {
        [USER_ROLES.PHARMACIE]: TYPE_ETABLISSEMENT.PHARMACIE,
        [USER_ROLES.HOPITAL]: TYPE_ETABLISSEMENT.HOPITAL,
        [USER_ROLES.CLINIQUE]: TYPE_ETABLISSEMENT.CLINIQUE,
      };
      profile = await Etablissement.findOne({
        where: { id: decoded.id, type: typeMap[role] },
        attributes: { exclude: ['password_hash'] },
      });
      if (profile) attachEtablissement(req, profile, role);
    }

    if (!profile) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    req.user = { id: decoded.id, role, profile };
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

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé pour ce profil',
    });
  }
  next();
};

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
module.exports.patientAuth = [authMiddleware, requireRole('patient')];
module.exports.medecinAuth = [authMiddleware, requireRole('medecin')];
module.exports.pharmacieAuth = [authMiddleware, requireRole('pharmacie')];
module.exports.structureAuth = [authMiddleware, requireRole('pharmacie', 'hopital', 'clinique')];
module.exports.adminAuth = [authMiddleware, requireRole('admin')];
