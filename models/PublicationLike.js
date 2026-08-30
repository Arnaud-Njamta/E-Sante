const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicationLike = sequelize.define('PublicationLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  publication_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  utilisateur_type: {
    type: DataTypes.ENUM('patient', 'medecin', 'pharmacie', 'hopital', 'clinique'),
    allowNull: false,
  },
  utilisateur_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'publication_likes',
  indexes: [{ unique: true, fields: ['publication_id', 'utilisateur_type', 'utilisateur_id'] }],
});

module.exports = PublicationLike;
