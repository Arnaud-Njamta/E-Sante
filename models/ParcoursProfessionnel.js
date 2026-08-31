const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ParcoursProfessionnel = sequelize.define('ParcoursProfessionnel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  medecin_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('experience', 'formation', 'certification'),
    allowNull: false,
    defaultValue: 'experience',
  },
  titre: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  organisme: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  lieu: {
    type: DataTypes.STRING(150),
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  actuel: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  ordre: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'parcours_professionnels',
});

module.exports = ParcoursProfessionnel;
