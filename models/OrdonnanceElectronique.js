const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdonnanceElectronique = sequelize.define('OrdonnanceElectronique', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  numero_unique: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  medecin_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rendez_vous_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  diagnostic: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  medicaments: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fichier_cachet_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  fichier_signature_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  statut: {
    type: DataTypes.ENUM('brouillon', 'signee', 'delivree', 'expiree', 'annulee'),
    allowNull: false,
    defaultValue: 'brouillon',
  },
  date_expiration: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  code_verification: {
    type: DataTypes.STRING(12),
    allowNull: true,
  },
}, {
  tableName: 'ordonnances_electroniques',
});

module.exports = OrdonnanceElectronique;
