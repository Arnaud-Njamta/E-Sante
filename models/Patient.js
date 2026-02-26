const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  contact_urgence: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  heure_reveil: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '07:00',
  },
  heure_coucher: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '23:00',
  },
  horaires_repas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      petit_dejeuner: '08:00',
      dejeuner: '12:30',
      diner: '19:30',
    },
  },
  allergies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  pathologies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  preferences_notification: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      push: true,
      sms: false,
      email: false,
      son: true,
      vibration: true,
      rappel_anticipe: true,
      relance_oubli: true,
    },
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'patients',
});

module.exports = Patient;
