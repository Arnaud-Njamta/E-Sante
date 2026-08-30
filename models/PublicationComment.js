const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicationComment = sequelize.define('PublicationComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  publication_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  auteur_type: {
    type: DataTypes.ENUM('patient', 'medecin', 'pharmacie', 'hopital', 'clinique'),
    allowNull: false,
  },
  auteur_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  auteur_nom: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'publication_comments',
});

module.exports = PublicationComment;
