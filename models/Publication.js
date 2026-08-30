const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Publication = sequelize.define('Publication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  auteur_type: {
    type: DataTypes.ENUM('medecin', 'pharmacie', 'hopital', 'clinique'),
    allowNull: false,
  },
  auteur_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  auteur_nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('actualite', 'realisation'),
    allowNull: false,
    defaultValue: 'actualite',
  },
  titre: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fichier_image_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  likes_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  comments_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  mis_en_avant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'publications',
});

module.exports = Publication;
