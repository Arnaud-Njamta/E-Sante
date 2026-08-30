const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtpCode = sequelize.define('OtpCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  code_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  usage: {
    type: DataTypes.ENUM('register', 'reset_password', 'rdv_reminder'),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verification_token: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  verification_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  consumed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'otp_codes',
  indexes: [
    { fields: ['telephone', 'usage'] },
    { fields: ['verification_token'] },
  ],
});

module.exports = OtpCode;
