const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PushSubscription = sequelize.define('PushSubscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_role: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  endpoint: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  p256dh: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  auth: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'push_subscriptions',
  indexes: [
    { unique: true, fields: ['endpoint'] },
    { fields: ['user_role', 'user_id'] },
  ],
});

module.exports = PushSubscription;
