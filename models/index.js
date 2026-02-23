const sequelize = require('../config/database');
const Patient = require('./Patient');
const Traitement = require('./Traitement');
const PriseProgrammee = require('./PriseProgrammee');
const HistoriquePrise = require('./HistoriquePrise');
const Ordonnance = require('./Ordonnance');

// ==================== ASSOCIATIONS ====================

// Patient -> Traitements (1:N)
Patient.hasMany(Traitement, { foreignKey: 'patient_id', as: 'traitements' });
Traitement.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Traitement -> PrisesProgrammees (1:N)
Traitement.hasMany(PriseProgrammee, { foreignKey: 'traitement_id', as: 'prises_programmees' });
PriseProgrammee.belongsTo(Traitement, { foreignKey: 'traitement_id', as: 'traitement' });

// PriseProgrammee -> HistoriquePrises (1:N)
PriseProgrammee.hasMany(HistoriquePrise, { foreignKey: 'prise_programmee_id', as: 'historique' });
HistoriquePrise.belongsTo(PriseProgrammee, { foreignKey: 'prise_programmee_id', as: 'prise_programmee' });

// Patient -> HistoriquePrises (1:N)
Patient.hasMany(HistoriquePrise, { foreignKey: 'patient_id', as: 'historique_prises' });
HistoriquePrise.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient -> Ordonnances (1:N)
Patient.hasMany(Ordonnance, { foreignKey: 'patient_id', as: 'ordonnances' });
Ordonnance.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

module.exports = {
  sequelize,
  Patient,
  Traitement,
  PriseProgrammee,
  HistoriquePrise,
  Ordonnance,
};
