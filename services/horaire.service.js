const { timeToMinutes, minutesToTime, parseJsonField } = require('../utils/helpers');

const normalizeRepas = (patient) => {
  const defaults = {
    petit_dejeuner: '08:00',
    dejeuner: '12:30',
    diner: '19:30',
  };
  const repas = parseJsonField(patient?.horaires_repas, defaults);
  return typeof repas === 'object' && repas !== null ? { ...defaults, ...repas } : defaults;
};

const genererHoraires = (patient, frequence, instructions = '') => {
  const reveil = patient?.heure_reveil || '07:00';
  const coucher = patient?.heure_coucher || '23:00';
  const repas = normalizeRepas(patient);

  const nbPrises = parseInt(frequence) || 1;
  const instructionsLower = (instructions || '').toLowerCase();

  // Cas "avec repas" ou "pendant repas" ou "après repas"
  if (instructionsLower.includes('repas') || instructionsLower.includes('pendant') || instructionsLower.includes('après')) {
    return horaireAvecRepas(repas, nbPrises);
  }

  // Cas "à jeun" ou "avant repas"
  if (instructionsLower.includes('jeun') || instructionsLower.includes('avant')) {
    return horaireAJeun(repas, reveil, nbPrises);
  }

  // Cas "au coucher" ou "le soir"
  if (instructionsLower.includes('coucher') || instructionsLower.includes('soir')) {
    return [minutesToTime(timeToMinutes(coucher) - 30)];
  }

  // Cas "le matin" ou "au réveil"
  if (instructionsLower.includes('matin') || instructionsLower.includes('réveil') || instructionsLower.includes('reveil')) {
    return [reveil];
  }

  // Cas par défaut : répartition uniforme dans la journée éveillée
  return repartitionUniforme(reveil, coucher, nbPrises);
};

/**
 * Horaires calés sur les repas
 */
const horaireAvecRepas = (repas, nbPrises) => {
  const heuresRepas = [repas.petit_dejeuner, repas.dejeuner, repas.diner];

  if (nbPrises === 1) return [heuresRepas[1]]; // déjeuner
  if (nbPrises === 2) return [heuresRepas[0], heuresRepas[2]]; // petit-déj + dîner
  if (nbPrises >= 3) return heuresRepas.slice(0, nbPrises); // les 3 repas

  return heuresRepas;
};

/**
 * Horaires à jeun (30 min avant les repas)
 */
const horaireAJeun = (repas, reveil, nbPrises) => {
  const avant = (timeStr) => minutesToTime(timeToMinutes(timeStr) - 30);

  if (nbPrises === 1) return [avant(repas.petit_dejeuner)];
  if (nbPrises === 2) return [avant(repas.petit_dejeuner), avant(repas.diner)];
  return [avant(repas.petit_dejeuner), avant(repas.dejeuner), avant(repas.diner)];
};

/**
 * Répartition uniforme sur la période d'éveil
 */
const repartitionUniforme = (reveil, coucher, nbPrises) => {
  const debut = timeToMinutes(reveil);
  const fin = timeToMinutes(coucher);
  const dureeEveil = fin - debut;
  const intervalle = Math.floor(dureeEveil / (nbPrises + 1));

  const horaires = [];
  for (let i = 1; i <= nbPrises; i++) {
    horaires.push(minutesToTime(debut + intervalle * i));
  }

  return horaires;
};

module.exports = {
  genererHoraires,
};
