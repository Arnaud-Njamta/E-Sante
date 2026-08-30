const {
  sequelize, Patient, Traitement, PriseProgrammee, HistoriquePrise,
  Ordonnance, RendezVous, Avis, Conversation, Message,
  OrdonnanceElectronique, OrdonnanceAuditLog, ReservationDispensaire,
} = require('../models');
const { POLITIQUE_CONFIDENTIALITE_VERSION, DPO_CONTACT } = require('../config/privacy');

const getProfile = async (patientId) => {
  const patient = await Patient.findByPk(patientId, {
    attributes: { exclude: ['password_hash', 'reset_password_token'] },
  });

  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

const updateProfile = async (patientId, data) => {
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const allowed = ['nom', 'prenom', 'date_naissance', 'telephone', 'contact_urgence', 'allergies', 'pathologies', 'preferences_notification'];
  const updateData = {};
  allowed.forEach((key) => {
    if (data[key] !== undefined) updateData[key] = data[key];
  });

  if (data.consentement_recherche !== undefined) {
    updateData.consentement_recherche = !!data.consentement_recherche;
    updateData.date_consentement = new Date();
    updateData.politique_version = POLITIQUE_CONFIDENTIALITE_VERSION;
  }

  await patient.update(updateData);

  const { password_hash, reset_password_token, ...patientData } = patient.toJSON();
  return patientData;
};

const updateParametresVie = async (patientId, data) => {
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (data.heure_reveil) updateData.heure_reveil = data.heure_reveil;
  if (data.heure_coucher) updateData.heure_coucher = data.heure_coucher;
  if (data.horaires_repas) {
    updateData.horaires_repas = {
      ...patient.horaires_repas,
      ...data.horaires_repas,
    };
  }

  await patient.update(updateData);

  const { password_hash, reset_password_token, ...patientData } = patient.toJSON();
  return patientData;
};

const exportPatientData = async (patientId) => {
  const patient = await getProfile(patientId);
  const [
    traitements, ordonnances, historique, rendez_vous,
    ordonnances_electroniques, reservations, avis, conversations,
  ] = await Promise.all([
    Traitement.findAll({ where: { patient_id: patientId } }),
    Ordonnance.findAll({ where: { patient_id: patientId }, attributes: { exclude: [] } }),
    HistoriquePrise.findAll({ where: { patient_id: patientId } }),
    RendezVous.findAll({ where: { patient_id: patientId } }),
    OrdonnanceElectronique.findAll({
      where: { patient_id: patientId },
      attributes: { exclude: ['code_verification'] },
    }),
    ReservationDispensaire.findAll({ where: { patient_id: patientId } }),
    Avis.findAll({ where: { patient_id: patientId } }),
    Conversation.findAll({
      where: { patient_id: patientId },
      include: [{ model: Message, as: 'messages' }],
    }),
  ]);

  return {
    exporte_le: new Date().toISOString(),
    politique_version: POLITIQUE_CONFIDENTIALITE_VERSION,
    contact_dpo: DPO_CONTACT,
    profil: patient,
    traitements,
    ordonnances: ordonnances.map((o) => {
      const j = o.toJSON();
      delete j.donnees_parsees;
      return j;
    }),
    historique_prises: historique,
    rendez_vous,
    ordonnances_electroniques,
    reservations_dispensaire: reservations,
    avis,
    conversations,
  };
};

const deletePatientAccount = async (patientId, { password, confirmation }) => {
  if (confirmation !== 'SUPPRIMER MON COMPTE') {
    const error = new Error('Confirmation invalide. Saisissez exactement : SUPPRIMER MON COMPTE');
    error.statusCode = 400;
    throw error;
  }

  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    const error = new Error('Patient non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const bcrypt = require('bcrypt');
  const valid = await bcrypt.compare(password, patient.password_hash);
  if (!valid) {
    const error = new Error('Mot de passe incorrect');
    error.statusCode = 401;
    throw error;
  }

  const ordIds = (await OrdonnanceElectronique.findAll({
    where: { patient_id: patientId },
    attributes: ['id'],
  })).map((o) => o.id);

  await sequelize.transaction(async (t) => {
    if (ordIds.length) {
      await OrdonnanceAuditLog.destroy({ where: { ordonnance_id: ordIds }, transaction: t });
      await ReservationDispensaire.destroy({ where: { ordonnance_electronique_id: ordIds }, transaction: t });
      await OrdonnanceElectronique.destroy({ where: { id: ordIds }, transaction: t });
    }
    await ReservationDispensaire.destroy({ where: { patient_id: patientId }, transaction: t });
    await HistoriquePrise.destroy({ where: { patient_id: patientId }, transaction: t });

    const traitIds = (await Traitement.findAll({ where: { patient_id: patientId }, attributes: ['id'], transaction: t }))
      .map((tr) => tr.id);
    if (traitIds.length) {
      await PriseProgrammee.destroy({ where: { traitement_id: traitIds }, transaction: t });
      await Traitement.destroy({ where: { id: traitIds }, transaction: t });
    }

    await Ordonnance.destroy({ where: { patient_id: patientId }, transaction: t });
    await RendezVous.destroy({ where: { patient_id: patientId }, transaction: t });
    await Avis.destroy({ where: { patient_id: patientId }, transaction: t });

    const convIds = (await Conversation.findAll({ where: { patient_id: patientId }, attributes: ['id'], transaction: t }))
      .map((c) => c.id);
    if (convIds.length) {
      await Message.destroy({ where: { conversation_id: convIds }, transaction: t });
      await Conversation.destroy({ where: { id: convIds }, transaction: t });
    }

    await patient.destroy({ transaction: t });
  });

  return { message: 'Compte et données associées supprimés définitivement.' };
};

module.exports = {
  getProfile,
  updateProfile,
  updateParametresVie,
  exportPatientData,
  deletePatientAccount,
};
