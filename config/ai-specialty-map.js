/**
 * Correspondance symptômes / situations → spécialités médicales
 */
const SPECIALTY_KEYWORDS = [
  { specialite: 'Cardiologie', keywords: ['coeur', 'cardiaque', 'poitrine', 'thorax', 'palpitation', 'infarctus', 'hypertension', 'tension'] },
  { specialite: 'Pédiatrie', keywords: ['enfant', 'bébé', 'bebe', 'nourrisson', 'adolescent', 'pédiatrie', 'pediatrie', 'vaccin'] },
  { specialite: 'Gynécologie', keywords: ['grossesse', 'enceinte', 'règles', 'regles', 'gynéco', 'gyneco', 'violence', 'agression', 'féminicide', 'feminicide', 'conjugale', 'viol conjugal', 'mari qui frappe'] },
  { specialite: 'Médecine générale', keywords: ['fièvre', 'fievre', 'paludisme', 'malaria', 'typhoïde', 'typhoide', 'migraine', 'fatigue', 'grippe', 'rhume', 'diabète', 'diabete'] },
];

const matchSpecialties = (text) => {
  const normalized = text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const scores = SPECIALTY_KEYWORDS.map(({ specialite, keywords }) => {
    const score = keywords.reduce((acc, kw) => (
      normalized.includes(kw.normalize('NFD').replace(/\p{Diacritic}/gu, '')) ? acc + 1 : acc
    ), 0);
    return { specialite, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  return scores.map((s) => s.specialite);
};

module.exports = { SPECIALTY_KEYWORDS, matchSpecialties };
