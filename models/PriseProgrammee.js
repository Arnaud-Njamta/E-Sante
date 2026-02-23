const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PriseProgrammee = sequelize.define('PriseProgrammee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  traitement_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'traitements', key: 'id' },
  },
  heure_prise: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  jour_semaine: {
    type: DataTypes.ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'),
    allowNull: true,
    comment: 'NULL = tous les jours',
  },
}, {
  tableName: 'prises_programmees',
});

module.exports = PriseProgrammee;
