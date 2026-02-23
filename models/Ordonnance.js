const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ordonnance = sequelize.define('Ordonnance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'patients', key: 'id' },
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  texte_extrait: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Texte brut extrait par OCR',
  },
  donnees_parsees: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Données structurées extraites (médicaments, dosages, fréquences)',
  },
  date_scan: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  statut: {
    type: DataTypes.ENUM('en_cours', 'validee', 'rejetee'),
    allowNull: false,
    defaultValue: 'en_cours',
  },
}, {
  tableName: 'ordonnances',
});

module.exports = Ordonnance;
