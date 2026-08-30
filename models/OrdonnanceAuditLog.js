const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdonnanceAuditLog = sequelize.define('OrdonnanceAuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ordonnance_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM('creee', 'signee', 'verifiee', 'delivree', 'expiree', 'annulee'),
    allowNull: false,
  },
  acteur_type: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  acteur_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'ordonnance_audit_logs',
  updatedAt: false,
});

module.exports = OrdonnanceAuditLog;
