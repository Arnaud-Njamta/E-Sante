const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InscriptionProfessionnel = sequelize.define('InscriptionProfessionnel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type_profil: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  nom_structure: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING(20),
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
  pays: {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: 'CM',
  },
  numero_ordre: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  numero_agrement: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  specialite: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  donnees: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'documents_manquants', 'en_revision', 'valide', 'rejete'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  motif_rejet: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  compte_cree_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  valide_par: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  date_validation: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'inscriptions_professionnels',
});

module.exports = InscriptionProfessionnel;
