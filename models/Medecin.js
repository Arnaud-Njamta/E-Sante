const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medecin = sequelize.define('Medecin', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  etablissement_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  specialite: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  profession: {
    type: DataTypes.ENUM(
      'medecin',
      'infirmier',
      'aide_soignant',
      'sage_femme',
      'kinesitherapeute',
    ),
    allowNull: false,
    defaultValue: 'medecin',
  },
  numero_ordre: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  competences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  langues: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ['Français'],
  },
  annees_experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  horaires_consultation: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      lundi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
      mardi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
      mercredi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
      jeudi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
      vendredi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
      samedi: { actif: false, creneaux: [] },
      dimanche: { actif: false, creneaux: [] },
      duree_creneau_minutes: 30,
    },
  },
  fichier_photo_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  fichier_cachet_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  accepte_teleconsultation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  tarif_consultation_fcfa: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  statut_validation: {
    type: DataTypes.ENUM('en_attente', 'valide', 'rejete', 'suspendu'),
    allowNull: false,
    defaultValue: 'valide',
  },
  note_moyenne: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 5.0,
  },
  nombre_avis: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  disponible_maintenant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  joignable_urgence: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  coordonnees_paiement: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'medecins',
});

module.exports = Medecin;
