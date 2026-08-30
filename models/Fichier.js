const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fichier = sequelize.define('Fichier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  proprietaire_type: {
    type: DataTypes.ENUM('patient', 'medecin', 'etablissement', 'produit', 'inscription', 'ordonnance'),
    allowNull: false,
  },
  proprietaire_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  type_fichier: {
    type: DataTypes.ENUM(
      'photo_profil', 'cachet', 'document', 'produit', 'ordonnance_pdf',
      'diplome', 'carte_ordre', 'agrement', 'autorisation'
    ),
    allowNull: false,
  },
  nom_original: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  taille: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: false,
  },
}, {
  tableName: 'fichiers',
  defaultScope: {
    attributes: { exclude: ['data'] },
  },
  scopes: {
    withData: { attributes: {} },
  },
});

module.exports = Fichier;
