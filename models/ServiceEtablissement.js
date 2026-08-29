const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceEtablissement = sequelize.define('ServiceEtablissement', {
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
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categorie: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  prix_indicatif: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  duree_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'services_etablissement',
});

module.exports = ServiceEtablissement;
