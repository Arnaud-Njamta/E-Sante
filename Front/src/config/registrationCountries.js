/**
 * Miroir front de config/registration-countries.js
 * Pays d'exercice pour l'inscription professionnelle (CM + FR).
 */

export const PAYS_INSCRIPTION = {
  CM: {
    code: 'CM',
    label: 'Cameroun',
    flag: '🇨🇲',
    indicatif: '+237',
    phonePlaceholder: '+237 6XX XX XX XX',
    regions: [
      'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
      'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
    ],
    defaultVille: 'Yaoundé',
    defaultRegion: 'Centre',
    mobileMoneyRequired: true,
    ordre: {
      medecin: { label: 'N° Ordre ONMC', hint: 'Inscription Ordre National des Médecins du Cameroun', example: 'ONMC-XXXX', required: true },
      infirmier: { label: 'N° Ordre / inscription ONI', hint: 'Numéro d\'ordre ou d\'inscription', example: 'ONI-XXXX', required: true },
      aide_soignant: { label: 'N° attestation (si disponible)', hint: 'Attestation de formation', required: false },
      sage_femme: { label: 'N° Ordre des sages-femmes', hint: 'Numéro d\'inscription à l\'ordre', required: true },
      kinesitherapeute: { label: 'N° Ordre / inscription', hint: 'Numéro professionnel', required: true },
    },
    sources_verification: [
      { nom: 'ONMC — Ordre National des Médecins du Cameroun' },
      { nom: 'MINSANTE — vérification diplômes' },
      { nom: 'MINESUP — équivalence diplômes étrangers' },
    ],
  },
  FR: {
    code: 'FR',
    label: 'France',
    flag: '🇫🇷',
    indicatif: '+33',
    phonePlaceholder: '+33 6 XX XX XX XX',
    regions: [
      'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire',
      'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie',
      'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur',
      'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte',
    ],
    defaultVille: 'Paris',
    defaultRegion: 'Île-de-France',
    mobileMoneyRequired: false,
    ordre: {
      medecin: { label: 'N° RPPS', hint: '11 chiffres (Annuaire Santé / CNOM)', example: '10003123456', required: true },
      infirmier: { label: 'N° RPPS / ADELI', hint: 'RPPS 11 chiffres ou ADELI 9 chiffres', example: '10003123456', required: true },
      aide_soignant: { label: 'N° RPPS / attestation', hint: 'RPPS si disponible', required: false },
      sage_femme: { label: 'N° RPPS', hint: '11 chiffres', example: '10003123456', required: true },
      kinesitherapeute: { label: 'N° RPPS / ADELI', hint: 'RPPS 11 chiffres ou ADELI 9 chiffres', example: '10003123456', required: true },
    },
    sources_verification: [
      { nom: 'CNOM — Conseil National de l\'Ordre des Médecins' },
      { nom: 'Annuaire Santé (ANS) — RPPS' },
      { nom: 'Agence du Numérique en Santé' },
    ],
  },
};

export const listPays = () => Object.values(PAYS_INSCRIPTION);

export const getPays = (code) => PAYS_INSCRIPTION[String(code || 'CM').toUpperCase()] || PAYS_INSCRIPTION.CM;

export function applyIndicatif(raw, paysCode = 'CM') {
  const pays = getPays(paysCode);
  const trimmed = String(raw || '').trim();
  if (!trimmed) return `${pays.indicatif} `;
  if (trimmed.startsWith('+')) return trimmed;
  if (pays.code === 'FR' && trimmed.startsWith('0')) {
    return `+33${trimmed.slice(1).replace(/\D/g, '')}`;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith(pays.indicatif.replace('+', ''))) {
    return `+${digits}`;
  }
  return `${pays.indicatif}${digits}`;
}
