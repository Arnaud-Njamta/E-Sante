const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Patient } = require('../models');

const SALT_ROUNDS = 12;

/**
 * Inscription d'un nouveau patient
 */
const register = async ({ email, password, nom, prenom, date_naissance, telephone }) => {
  const existingPatient = await Patient.findOne({ where: { email } });
  if (existingPatient) {
    const error = new Error('Un compte avec cet email existe déjà');
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const patient = await Patient.create({
    email,
    password_hash,
    nom,
    prenom,
    date_naissance,
    telephone,
  });

  const token = generateToken(patient.id);
  const refreshToken = generateRefreshToken(patient.id);

  return {
    patient: formatPatient(patient),
    token,
    refreshToken,
  };
};

/**
 * Connexion d'un patient
 */
const login = async ({ email, password }) => {
  const patient = await Patient.findOne({ where: { email } });
  if (!patient) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, patient.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Email ou mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(patient.id);
  const refreshToken = generateRefreshToken(patient.id);

  return {
    patient: formatPatient(patient),
    token,
    refreshToken,
  };
};

/**
 * Rafraîchir le token JWT
 */
const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const patient = await Patient.findByPk(decoded.id);

    if (!patient) {
      const error = new Error('Patient non trouvé');
      error.statusCode = 404;
      throw error;
    }

    const newToken = generateToken(patient.id);
    const newRefreshToken = generateRefreshToken(patient.id);

    return { token: newToken, refreshToken: newRefreshToken };
  } catch (err) {
    const error = new Error('Token de rafraîchissement invalide');
    error.statusCode = 401;
    throw error;
  }
};

// ==================== HELPERS INTERNES ====================

const generateToken = (patientId) => {
  return jwt.sign({ id: patientId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (patientId) => {
  return jwt.sign({ id: patientId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const formatPatient = (patient) => {
  const { password_hash, ...patientData } = patient.toJSON();
  return patientData;
};

module.exports = {
  register,
  login,
  refreshToken,
};
