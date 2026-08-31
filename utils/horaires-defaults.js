/** Horaires par défaut — partagés médecin / cabinet / affiliation */
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const DEFAULT_HORAIRES_MEDECIN = {
  duree_creneau_minutes: 30,
  lundi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
  mardi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
  mercredi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
  jeudi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '18:00' }] },
  vendredi: { actif: true, creneaux: [{ debut: '08:00', fin: '12:00' }, { debut: '14:00', fin: '17:00' }] },
  samedi: { actif: false, creneaux: [] },
  dimanche: { actif: false, creneaux: [] },
};

const emptyHoraires = () => JSON.parse(JSON.stringify(DEFAULT_HORAIRES_MEDECIN));

module.exports = { JOURS, DEFAULT_HORAIRES_MEDECIN, emptyHoraires };
