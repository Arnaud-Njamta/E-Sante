const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReservationDispensaire = sequelize.define('ReservationDispensaire', {
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
  ordonnance_electronique_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  lignes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  message_patient: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reponse_etablissement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'confirmee', 'refusee', 'prete', 'retiree', 'annulee'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  date_retrait_souhaitee: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  montant_total_fcfa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'reservations_dispensaire',
});

module.exports = ReservationDispensaire;
