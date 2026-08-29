const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Avis = sequelize.define('Avis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  cible_type: {
    type: DataTypes.ENUM('etablissement', 'medecin'),
    allowNull: false,
  },
  cible_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  note: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'avis',
  indexes: [
    { unique: true, fields: ['patient_id', 'cible_type', 'cible_id'] },
  ],
});

module.exports = Avis;
