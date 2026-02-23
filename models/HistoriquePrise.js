const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoriquePrise = sequelize.define('HistoriquePrise', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  prise_programmee_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'prises_programmees', key: 'id' },
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'patients', key: 'id' },
  },
  date_heure_prevue: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  date_heure_reelle: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'NULL si oubli',
  },
  statut: {
    type: DataTypes.ENUM('pris', 'oublie', 'retard', 'reporte'),
    allowNull: false,
    defaultValue: 'oublie',
  },
  retard_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  tableName: 'historique_prises',
});

module.exports = HistoriquePrise;
