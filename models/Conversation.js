const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  pharmacie_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  sujet: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Demande de disponibilité',
  },
  statut: {
    type: DataTypes.ENUM('ouverte', 'fermee'),
    allowNull: false,
    defaultValue: 'ouverte',
  },
  dernier_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'conversations',
  indexes: [
    { unique: true, fields: ['patient_id', 'pharmacie_id'] },
  ],
});

module.exports = Conversation;
