const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Etablissement = sequelize.define('Etablissement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('pharmacie', 'hopital', 'clinique'),
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  ville: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  numero_agrement: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  statut_validation: {
    type: DataTypes.ENUM('en_attente', 'valide', 'rejete', 'suspendu'),
    allowNull: false,
    defaultValue: 'valide',
  },
  fichier_photo_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  fichier_cachet_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  modes_paiement: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ['especes', 'orange_money', 'wave'],
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  horaires_ouverture: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      lundi: { ouvert: true, debut: '08:00', fin: '20:00' },
      mardi: { ouvert: true, debut: '08:00', fin: '20:00' },
      mercredi: { ouvert: true, debut: '08:00', fin: '20:00' },
      jeudi: { ouvert: true, debut: '08:00', fin: '20:00' },
      vendredi: { ouvert: true, debut: '08:00', fin: '20:00' },
      samedi: { ouvert: true, debut: '09:00', fin: '18:00' },
      dimanche: { ouvert: false, debut: null, fin: null },
      h24: false,
    },
  },
  note_moyenne: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 5.0,
  },
  nombre_avis: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  chat_actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  coordonnees_paiement: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'etablissements',
});

module.exports = Etablissement;
