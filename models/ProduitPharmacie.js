const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProduitPharmacie = sequelize.define('ProduitPharmacie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pharmacie_id: {
    type: DataTypes.UUID,
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
  categorie: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'general',
  },
  prix_fcfa: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stock_disponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  necessite_ordonnance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  fichier_image_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'produits_pharmacie',
});

module.exports = ProduitPharmacie;
