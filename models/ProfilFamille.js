const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProfilFamille = sequelize.define('ProfilFamille', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
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
  relation: {
    type: DataTypes.ENUM('enfant', 'parent', 'conjoint', 'autre'),
    allowNull: false,
    defaultValue: 'autre',
  },
  groupe_sanguin: {
    type: DataTypes.STRING(5),
    allowNull: true,
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
  traitements_habituelles: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  vaccinations: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  contact_urgence: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notes_medicales: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  observations_carnet: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  qr_token: {
    type: DataTypes.STRING(64),
    allowNull: true,
    unique: true,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'profils_famille',
});

module.exports = ProfilFamille;
