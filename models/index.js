const sequelize = require('../config/database');
const Patient = require('./Patient');
const Traitement = require('./Traitement');
const PriseProgrammee = require('./PriseProgrammee');
const HistoriquePrise = require('./HistoriquePrise');
const Ordonnance = require('./Ordonnance');
const Etablissement = require('./Etablissement');
const ServiceEtablissement = require('./ServiceEtablissement');
const Medecin = require('./Medecin');
const Avis = require('./Avis');
const Conversation = require('./Conversation');
const Message = require('./Message');

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

// Etablissement -> Services (1:N)
Etablissement.hasMany(ServiceEtablissement, { foreignKey: 'etablissement_id', as: 'services' });
ServiceEtablissement.belongsTo(Etablissement, { foreignKey: 'etablissement_id', as: 'etablissement' });

// Etablissement -> Medecins (1:N)
Etablissement.hasMany(Medecin, { foreignKey: 'etablissement_id', as: 'medecins' });
Medecin.belongsTo(Etablissement, { foreignKey: 'etablissement_id', as: 'etablissement' });

// Patient -> Avis (1:N)
Patient.hasMany(Avis, { foreignKey: 'patient_id', as: 'avis' });
Avis.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient -> Conversations (1:N)
Patient.hasMany(Conversation, { foreignKey: 'patient_id', as: 'conversations' });
Conversation.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Pharmacie -> Conversations (1:N)
Etablissement.hasMany(Conversation, { foreignKey: 'pharmacie_id', as: 'conversations' });
Conversation.belongsTo(Etablissement, { foreignKey: 'pharmacie_id', as: 'pharmacie' });

// Conversation -> Messages (1:N)
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

module.exports = {
  sequelize,
  Patient,
  Traitement,
  PriseProgrammee,
  HistoriquePrise,
  Ordonnance,
  Etablissement,
  ServiceEtablissement,
  Medecin,
  Avis,
  Conversation,
  Message,
};
