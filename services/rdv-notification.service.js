const { Patient, Medecin } = require('../models');
const emailService = require('./email.service');
const { bustNotificationCache } = require('./notification.service');

const loadRdvParties = async (rdv) => {
  const json = rdv.toJSON ? rdv.toJSON() : rdv;
  const [patient, medecin] = await Promise.all([
    json.patient?.email
      ? Promise.resolve(json.patient)
      : Patient.findByPk(json.patient_id, { attributes: ['id', 'email', 'prenom', 'nom'] }),
    json.medecin?.email
      ? Promise.resolve(json.medecin)
      : Medecin.findByPk(json.medecin_id, { attributes: ['id', 'email', 'prenom', 'nom', 'specialite'] }),
  ]);
  return { rdv: json, patient, medecin };
};

const formatRdvLabel = (rdv) => `${rdv.date_rdv} à ${rdv.heure_debut}`;

const notifyAfterRdv = async (rdv, event) => {
  try {
    const { patient, medecin } = await loadRdvParties(rdv);
    const rdvLabel = formatRdvLabel(rdv);
    const medecinLabel = medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'votre médecin';
    const patientLabel = patient ? `${patient.prenom} ${patient.nom}` : 'un patient';

    switch (event) {
      case 'demande':
        await emailService.sendRdvDemandeEmail({
          medecinEmail: medecin?.email,
          medecinPrenom: medecin?.prenom,
          patientLabel,
          rdvLabel,
          motif: rdv.motif,
        });
        await emailService.sendRdvDemandePatientEmail({
          patientEmail: patient?.email,
          patientPrenom: patient?.prenom,
          medecinLabel,
          rdvLabel,
        });
        break;
      case 'confirme':
        await emailService.sendRdvConfirmeEmail({
          patientEmail: patient?.email,
          patientPrenom: patient?.prenom,
          medecinLabel,
          rdvLabel,
          typeConsultation: rdv.type_consultation,
          lienVideo: rdv.lien_video,
          notesMedecin: rdv.notes_medecin,
        });
        break;
      case 'refuse':
        await emailService.sendRdvRefuseEmail({
          patientEmail: patient?.email,
          patientPrenom: patient?.prenom,
          medecinLabel,
          rdvLabel,
          notesMedecin: rdv.notes_medecin,
        });
        break;
      case 'contre_proposition':
        await emailService.sendRdvContrePropositionEmail({
          patientEmail: patient?.email,
          patientPrenom: patient?.prenom,
          medecinLabel,
          rdvLabel: formatRdvLabel({
            date_rdv: rdv.date_proposee,
            heure_debut: rdv.heure_debut_proposee,
          }),
          message: rdv.message_contre_proposition,
        });
        break;
      case 'termine':
        await emailService.sendRdvTermineEmail({
          patientEmail: patient?.email,
          patientPrenom: patient?.prenom,
          medecinLabel,
          medecinId: medecin?.id,
        });
        break;
      default:
        break;
    }

    if (patient?.id) bustNotificationCache('patient', patient.id);
    if (medecin?.id) bustNotificationCache('medecin', medecin.id);
  } catch (err) {
    console.error('[RDV NOTIFY]', event, err.message);
  }
};

module.exports = { notifyAfterRdv };
