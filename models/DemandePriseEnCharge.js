const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DemandePriseEnCharge = sequelize.define('DemandePriseEnCharge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  numero_reference: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  etablissement_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  service_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  type_urgence: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  message_patient: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_souhaitee: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  priorite: {
    type: DataTypes.ENUM('normal', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'confirmee', 'refusee', 'annulee'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  reponse_etablissement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_proposee: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  heure_proposee: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
}, {
  tableName: 'demandes_prise_en_charge',
});

module.exports = DemandePriseEnCharge;
