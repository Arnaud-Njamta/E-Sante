const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MembreEquipeEtablissement = sequelize.define('MembreEquipeEtablissement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  etablissement_id: {
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
  role: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Pharmacien',
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING(20),
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
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  ordre: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'membres_equipe_etablissement',
});

module.exports = MembreEquipeEtablissement;
