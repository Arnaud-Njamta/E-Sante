const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Traitement = sequelize.define('Traitement', {
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
  nom_medicament: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  forme: {
    type: DataTypes.ENUM('comprime', 'gelule', 'sirop', 'injection', 'patch', 'gouttes', 'pommade', 'suppositoire', 'inhalateur', 'autre'),
    allowNull: true,
    defaultValue: 'comprime',
  },
  frequence: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ex: 3 fois par jour, 1 fois par semaine',
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ex: à jeun, avec repas, au coucher',
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  statut: {
    type: DataTypes.ENUM('actif', 'termine', 'arrete'),
    allowNull: false,
    defaultValue: 'actif',
  },
}, {
  tableName: 'traitements',
});

module.exports = Traitement;
