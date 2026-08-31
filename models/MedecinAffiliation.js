const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedecinAffiliation = sequelize.define('MedecinAffiliation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  medecin_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  etablissement_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  type_lieu: {
    type: DataTypes.ENUM('hopital', 'clinique', 'cabinet_prive'),
    allowNull: false,
    defaultValue: 'clinique',
  },
  role: {
    type: DataTypes.ENUM('titulaire', 'associe', 'remplacant', 'consultant', 'employe'),
    allowNull: false,
    defaultValue: 'employe',
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'actif', 'refuse', 'termine'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  nom_lieu: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ville: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  horaires: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  message_invitation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  actuel: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'medecin_affiliations',
});

module.exports = MedecinAffiliation;
