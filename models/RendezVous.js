const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RendezVous = sequelize.define('RendezVous', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  medecin_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  etablissement_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  date_rdv: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  heure_debut: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  heure_fin: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  motif: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  type_consultation: {
    type: DataTypes.ENUM('presentiel', 'teleconsultation'),
    allowNull: false,
    defaultValue: 'presentiel',
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'confirme', 'contre_proposition', 'annule', 'termine', 'absent'),
    allowNull: false,
    defaultValue: 'en_attente',
  },
  notes_medecin: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes_patient: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rappel_envoye: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lien_video: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  date_proposee: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  heure_debut_proposee: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  heure_fin_proposee: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  message_contre_proposition: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'rendez_vous',
});

module.exports = RendezVous;
