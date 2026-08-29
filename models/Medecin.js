const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medecin = sequelize.define('Medecin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  etablissement_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  specialite: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  numero_ordre: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  competences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  langues: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ['Français'],
  },
  annees_experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  horaires_consultation: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  note_moyenne: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 5.0,
  },
  nombre_avis: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'medecins',
});

module.exports = Medecin;
