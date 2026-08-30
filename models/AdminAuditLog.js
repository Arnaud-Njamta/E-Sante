const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminAuditLog = sequelize.define('AdminAuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  categorie: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  acteur_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  acteur_label: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  cible_type: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  cible_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
}, {
  tableName: 'admin_audit_logs',
  updatedAt: false,
  indexes: [
    { fields: ['categorie'] },
    { fields: ['action'] },
    { fields: ['cible_type', 'cible_id'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = AdminAuditLog;
