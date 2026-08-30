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
const Fichier = require('./Fichier');
const RendezVous = require('./RendezVous');
const ProduitPharmacie = require('./ProduitPharmacie');
const OrdonnanceElectronique = require('./OrdonnanceElectronique');
const InscriptionProfessionnel = require('./InscriptionProfessionnel');
const Publication = require('./Publication');
const PublicationLike = require('./PublicationLike');
const PublicationComment = require('./PublicationComment');
const ReservationDispensaire = require('./ReservationDispensaire');
const OrdonnanceAuditLog = require('./OrdonnanceAuditLog');
const AdminAuditLog = require('./AdminAuditLog');
const Admin = require('./Admin');
const Transaction = require('./Transaction');
const OtpCode = require('./OtpCode');

// ==================== ASSOCIATIONS ====================

Patient.hasMany(Traitement, { foreignKey: 'patient_id', as: 'traitements' });
Traitement.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Traitement.hasMany(PriseProgrammee, { foreignKey: 'traitement_id', as: 'prises_programmees' });
PriseProgrammee.belongsTo(Traitement, { foreignKey: 'traitement_id', as: 'traitement' });

PriseProgrammee.hasMany(HistoriquePrise, { foreignKey: 'prise_programmee_id', as: 'historique' });
HistoriquePrise.belongsTo(PriseProgrammee, { foreignKey: 'prise_programmee_id', as: 'prise_programmee' });

Patient.hasMany(HistoriquePrise, { foreignKey: 'patient_id', as: 'historique_prises' });
HistoriquePrise.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Patient.hasMany(Ordonnance, { foreignKey: 'patient_id', as: 'ordonnances' });
Ordonnance.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Etablissement.hasMany(ServiceEtablissement, { foreignKey: 'etablissement_id', as: 'services' });
ServiceEtablissement.belongsTo(Etablissement, { foreignKey: 'etablissement_id', as: 'etablissement' });

Etablissement.hasMany(Medecin, { foreignKey: 'etablissement_id', as: 'medecins' });
Medecin.belongsTo(Etablissement, { foreignKey: 'etablissement_id', as: 'etablissement' });

Patient.hasMany(Avis, { foreignKey: 'patient_id', as: 'avis' });
Avis.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Patient.hasMany(Conversation, { foreignKey: 'patient_id', as: 'conversations' });
Conversation.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Etablissement.hasMany(Conversation, { foreignKey: 'pharmacie_id', as: 'conversations' });
Conversation.belongsTo(Etablissement, { foreignKey: 'pharmacie_id', as: 'pharmacie' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

// Rendez-vous
Patient.hasMany(RendezVous, { foreignKey: 'patient_id', as: 'rendez_vous' });
RendezVous.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Medecin.hasMany(RendezVous, { foreignKey: 'medecin_id', as: 'rendez_vous' });
RendezVous.belongsTo(Medecin, { foreignKey: 'medecin_id', as: 'medecin' });
Etablissement.hasMany(RendezVous, { foreignKey: 'etablissement_id', as: 'rendez_vous' });
RendezVous.belongsTo(Etablissement, { foreignKey: 'etablissement_id', as: 'etablissement' });

// Produits pharmacie
Etablissement.hasMany(ProduitPharmacie, { foreignKey: 'pharmacie_id', as: 'produits' });
ProduitPharmacie.belongsTo(Etablissement, { foreignKey: 'pharmacie_id', as: 'pharmacie' });

// Ordonnances électroniques
Medecin.hasMany(OrdonnanceElectronique, { foreignKey: 'medecin_id', as: 'ordonnances_emises' });
OrdonnanceElectronique.belongsTo(Medecin, { foreignKey: 'medecin_id', as: 'medecin' });
Patient.hasMany(OrdonnanceElectronique, { foreignKey: 'patient_id', as: 'ordonnances_electroniques' });
OrdonnanceElectronique.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
RendezVous.hasOne(OrdonnanceElectronique, { foreignKey: 'rendez_vous_id', as: 'ordonnance' });
OrdonnanceElectronique.belongsTo(RendezVous, { foreignKey: 'rendez_vous_id', as: 'rendez_vous' });

Publication.hasMany(PublicationLike, { foreignKey: 'publication_id', as: 'likes' });
PublicationLike.belongsTo(Publication, { foreignKey: 'publication_id', as: 'publication' });
Publication.hasMany(PublicationComment, { foreignKey: 'publication_id', as: 'comments' });
PublicationComment.belongsTo(Publication, { foreignKey: 'publication_id', as: 'publication' });

Patient.hasMany(ReservationDispensaire, { foreignKey: 'patient_id', as: 'reservations_dispensaire' });
ReservationDispensaire.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Etablissement.hasMany(ReservationDispensaire, { foreignKey: 'etablissement_id', as: 'reservations' });
ReservationDispensaire.belongsTo(Etablissement, { foreignKey: 'etablissement_id', as: 'etablissement' });
OrdonnanceElectronique.hasMany(ReservationDispensaire, { foreignKey: 'ordonnance_electronique_id', as: 'reservations' });
ReservationDispensaire.belongsTo(OrdonnanceElectronique, { foreignKey: 'ordonnance_electronique_id', as: 'ordonnance' });

OrdonnanceElectronique.hasMany(OrdonnanceAuditLog, { foreignKey: 'ordonnance_id', as: 'audit_logs' });
OrdonnanceAuditLog.belongsTo(OrdonnanceElectronique, { foreignKey: 'ordonnance_id', as: 'ordonnance' });

Patient.hasMany(Transaction, { foreignKey: 'patient_id', as: 'transactions' });
Transaction.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

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
  Fichier,
  RendezVous,
  ProduitPharmacie,
  OrdonnanceElectronique,
  InscriptionProfessionnel,
  Publication,
  PublicationLike,
  PublicationComment,
  ReservationDispensaire,
  OrdonnanceAuditLog,
  AdminAuditLog,
  Admin,
  Transaction,
  OtpCode,
};
