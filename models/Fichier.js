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
      'photo_profil', 'cachet', 'signature', 'document', 'produit', 'ordonnance_pdf',
      'diplome', 'carte_ordre', 'agrement', 'autorisation',
      'piece_identite', 'casier_judiciaire',
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
  chemin_disque: {
    type: DataTypes.STRING(512),
    allowNull: true,
    comment: 'Chemin relatif sous UPLOAD_DIR (stockage disque, pas de BLOB en base)',
  },
  data: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    comment: 'Legacy — anciens fichiers uniquement ; nouveaux uploads → chemin_disque',
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
