const jwt = require('jsonwebtoken');
const { Patient, Medecin, Etablissement, Admin } = require('../models');
const { USER_ROLES, TYPE_ETABLISSEMENT } = require('../utils/constants');
const { MemoryCache } = require('../utils/memory-cache');

const PROFILE_CACHE_TTL = parseInt(process.env.AUTH_PROFILE_CACHE_TTL_MS || '120000', 10);
const profileCache = new MemoryCache({
  ttlMs: PROFILE_CACHE_TTL,
  maxSize: parseInt(process.env.AUTH_PROFILE_CACHE_MAX || '8000', 10),
});

const profileKey = (role, id) => `${role}:${id}`;

const attachEtablissement = (req, profile, role) => {
  req.etablissement = profile;
  if (role === USER_ROLES.PHARMACIE) req.pharmacie = profile;
  if (role === USER_ROLES.HOPITAL) req.hopital = profile;
  if (role === USER_ROLES.CLINIQUE) req.clinique = profile;
};

const loadProfileFromDb = async (id, role) => {
  if (role === USER_ROLES.ADMIN) {
    return Admin.findByPk(id, { attributes: { exclude: ['password_hash'] } });
  }
  if (role === USER_ROLES.PATIENT) {
    return Patient.findByPk(id, { attributes: { exclude: ['password_hash'] } });
  }
  if (role === USER_ROLES.MEDECIN) {
    return Medecin.findByPk(id, { attributes: { exclude: ['password_hash'] } });
  }
  if ([USER_ROLES.PHARMACIE, USER_ROLES.HOPITAL, USER_ROLES.CLINIQUE].includes(role)) {
    const typeMap = {
      [USER_ROLES.PHARMACIE]: TYPE_ETABLISSEMENT.PHARMACIE,
      [USER_ROLES.HOPITAL]: TYPE_ETABLISSEMENT.HOPITAL,
      [USER_ROLES.CLINIQUE]: TYPE_ETABLISSEMENT.CLINIQUE,
    };
    return Etablissement.findOne({
      where: { id, type: typeMap[role] },
      attributes: { exclude: ['password_hash'] },
    });
  }
  return null;
};

const getProfile = async (id, role) => {
  const key = profileKey(role, id);
  const cached = profileCache.get(key);
  if (cached) return cached;

  const row = await loadProfileFromDb(id, role);
  if (!row) return null;

  const plain = row.toJSON ? row.toJSON() : row;
  profileCache.set(key, plain);
  return plain;
};

const invalidateProfile = (id, role) => {
  if (id && role) profileCache.delete(profileKey(role, id));
};

const attachRoleShortcut = (req, profile, role) => {
  if (role === USER_ROLES.ADMIN) req.admin = profile;
  if (role === USER_ROLES.PATIENT) req.patient = profile;
  if (role === USER_ROLES.MEDECIN) req.medecin = profile;
  if ([USER_ROLES.PHARMACIE, USER_ROLES.HOPITAL, USER_ROLES.CLINIQUE].includes(role)) {
    attachEtablissement(req, profile, role);
  }
};

const resolveUserFromRequest = async (req) => {
  let authHeader = req.headers.authorization;
  if ((!authHeader || !authHeader.startsWith('Bearer ')) && req.query.access_token) {
    authHeader = `Bearer ${req.query.access_token}`;
  }
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const role = decoded.role || USER_ROLES.PATIENT;

  const profile = await getProfile(decoded.id, role);
  if (!profile) return null;

  attachRoleShortcut(req, profile, role);
  return { id: decoded.id, role, profile };
};

const authMiddleware = async (req, res, next) => {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant ou utilisateur non trouvé',
      });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expiré' });
    }
    return res.status(401).json({ success: false, message: 'Token invalide' });
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
module.exports.invalidateProfile = invalidateProfile;
module.exports.getProfile = getProfile;

/** Auth optionnelle — pour fichiers publics (images profil, produits, actualités). */
module.exports.optionalAuthMiddleware = async (req, res, next) => {
  try {
    req.user = await resolveUserFromRequest(req);
  } catch {
    req.user = null;
  }
  next();
};
module.exports.patientAuth = [authMiddleware, requireRole('patient')];
module.exports.medecinAuth = [authMiddleware, requireRole('medecin')];
module.exports.pharmacieAuth = [authMiddleware, requireRole('pharmacie')];
module.exports.structureAuth = [authMiddleware, requireRole('pharmacie', 'hopital', 'clinique')];
module.exports.adminAuth = [authMiddleware, requireRole('admin')];
