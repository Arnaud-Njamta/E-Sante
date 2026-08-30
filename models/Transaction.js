const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('consultation', 'pharmacie'),
    allowNull: false,
  },
  statut_paiement: {
    type: DataTypes.ENUM('en_attente', 'paye', 'rembourse', 'annule'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  montant_brut_fcfa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  commission_fcfa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  montant_net_fcfa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  taux_commission: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  beneficiaire_type: {
    type: DataTypes.ENUM('medecin', 'etablissement'),
    allowNull: false,
  },
  beneficiaire_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reference_type: {
    type: DataTypes.ENUM('rendez_vous', 'reservation_dispensaire'),
    allowNull: false,
  },
  reference_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  libelle: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  reference_paiement: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  provider: {
    type: DataTypes.ENUM('cinetpay', 'simulation'),
    allowNull: true,
  },
  canal_paiement: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  paye_le: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadonnees_paiement: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  statut_reversement: {
    type: DataTypes.ENUM('non_applicable', 'en_attente', 'reverse', 'echec'),
    allowNull: true,
  },
  reverse_le: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reference_reversement: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  metadonnees_reversement: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'transactions',
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['beneficiaire_type', 'beneficiaire_id'] },
    { fields: ['reference_type', 'reference_id'], unique: true },
    { fields: ['statut_paiement'] },
    { fields: ['reference_paiement'], unique: true },
  ],
});

module.exports = Transaction;
