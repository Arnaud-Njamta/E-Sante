const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConsentementPatient = sequelize.define('ConsentementPatient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  medecin_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  rendez_vous_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  politique_version: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '2026-01',
  },
  accepte: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'consentements_patients',
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = ConsentementPatient;
