/**
 * Pays d'exercice acceptés pour l'inscription professionnelle.
 * Cameroun (historique) + France (médecins / soignants).
 */

const PAYS_INSCRIPTION = {
  CM: {
    code: 'CM',
    label: 'Cameroun',
    flag: '🇨🇲',
    indicatif: '+237',
    phoneDigitsNational: 9,
    phonePlaceholder: '+237 6XX XX XX XX',
    regions: [
      'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
      'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
    ],
    defaultVille: 'Yaoundé',
    defaultRegion: 'Centre',
    monnaies: ['XAF'],
    mobileMoneyRequired: true,
    ordre: {
      medecin: {
        label: 'N° Ordre ONMC',
        hint: 'Numéro d\'inscription à l\'Ordre National des Médecins du Cameroun',
        pattern: /^[A-Za-z0-9][A-Za-z0-9\-\/]{3,29}$/,
        example: 'ONMC-XXXX',
      },
      infirmier: {
        label: 'N° Ordre / inscription ONI',
        hint: 'Numéro d\'ordre ou d\'inscription professionnelle infirmière',
        pattern: /^[A-Za-z0-9][A-Za-z0-9\-\/]{3,29}$/,
        example: 'ONI-XXXX',
      },
      aide_soignant: {
        label: 'N° attestation (si disponible)',
        hint: 'Attestation de formation ou d\'exercice',
        pattern: null,
        optional: true,
      },
      sage_femme: {
        label: 'N° Ordre des sages-femmes',
        hint: 'Numéro d\'inscription à l\'ordre',
        pattern: /^[A-Za-z0-9][A-Za-z0-9\-\/]{3,29}$/,
        example: 'OSF-XXXX',
      },
      kinesitherapeute: {
        label: 'N° Ordre / inscription',
        hint: 'Numéro d\'ordre ou d\'inscription professionnelle',
        pattern: /^[A-Za-z0-9][A-Za-z0-9\-\/]{3,29}$/,
        example: 'KIN-XXXX',
      },
    },
    sources_verification: [
      {
        nom: 'ONMC — Ordre National des Médecins du Cameroun',
        usage: 'Inscription au tableau, carte professionnelle, attestation',
        url: 'https://onmc.cm/',
      },
      {
        nom: 'MINSANTE — vérification diplômes (QR / code)',
        usage: 'Authentifier diplômes émis via scolarité MINSANTE',
        url: 'https://scolarite.minsante.cm/verify',
      },
      {
        nom: 'MINESUP — équivalence diplômes étrangers',
        usage: 'Diplômes hors Cameroun / hors CAMES',
        url: 'https://equivalence.cm',
      },
    ],
  },
  FR: {
    code: 'FR',
    label: 'France',
    flag: '🇫🇷',
    indicatif: '+33',
    phoneDigitsNational: 9,
    phonePlaceholder: '+33 6 XX XX XX XX',
    regions: [
      'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire',
      'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie',
      'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur',
      'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte',
    ],
    defaultVille: 'Paris',
    defaultRegion: 'Île-de-France',
    monnaies: ['EUR'],
    mobileMoneyRequired: false,
    ordre: {
      medecin: {
        label: 'N° RPPS',
        hint: 'Identifiant RPPS à 11 chiffres (Ordre des médecins / ANS)',
        pattern: /^\d{11}$/,
        example: '10003123456',
      },
      infirmier: {
        label: 'N° RPPS / ADELI',
        hint: 'RPPS (11 chiffres) ou ancien ADELI (9 chiffres)',
        pattern: /^\d{9}$|^\d{11}$/,
        example: '10003123456',
      },
      aide_soignant: {
        label: 'N° RPPS / attestation',
        hint: 'RPPS si disponible, sinon numéro d\'attestation',
        pattern: null,
        optional: true,
      },
      sage_femme: {
        label: 'N° RPPS',
        hint: 'Identifiant RPPS à 11 chiffres',
        pattern: /^\d{11}$/,
        example: '10003123456',
      },
      kinesitherapeute: {
        label: 'N° RPPS / ADELI',
        hint: 'RPPS (11 chiffres) ou ADELI (9 chiffres)',
        pattern: /^\d{9}$|^\d{11}$/,
        example: '10003123456',
      },
    },
    sources_verification: [
      {
        nom: 'CNOM — Conseil National de l\'Ordre des Médecins',
        usage: 'Annuaire et inscription au tableau de l\'Ordre',
        url: 'https://www.conseil-national.medecin.fr/',
      },
      {
        nom: 'Annuaire Santé (ANS) — RPPS',
        usage: 'Vérifier le numéro RPPS d\'un professionnel',
        url: 'https://annuaire.sante.fr/',
      },
      {
        nom: 'Agence du Numérique en Santé',
        usage: 'Référentiels d\'identification des professionnels de santé',
        url: 'https://esante.gouv.fr/',
      },
    ],
  },
};

const listPays = () => Object.values(PAYS_INSCRIPTION).map((p) => ({
  code: p.code,
  label: p.label,
  flag: p.flag,
  indicatif: p.indicatif,
  phonePlaceholder: p.phonePlaceholder,
  regions: p.regions,
  defaultVille: p.defaultVille,
  defaultRegion: p.defaultRegion,
  mobileMoneyRequired: p.mobileMoneyRequired,
}));

const getPays = (code) => PAYS_INSCRIPTION[String(code || 'CM').toUpperCase()] || PAYS_INSCRIPTION.CM;

const normalizeTelephonePays = (raw, paysCode = 'CM') => {
  const pays = getPays(paysCode);
  const digits = String(raw || '').replace(/\D/g, '');
  const cc = pays.indicatif.replace('+', '');

  if (!digits) return '';

  if (digits.startsWith(cc)) {
    const national = digits.slice(cc.length);
    if (national.length >= pays.phoneDigitsNational - 1) {
      return `+${cc}${national}`;
    }
  }

  // France : souvent saisi avec 0 initial (06...)
  if (pays.code === 'FR' && digits.startsWith('0') && digits.length === 10) {
    return `+33${digits.slice(1)}`;
  }

  // Cameroun : 6XXXXXXXX
  if (pays.code === 'CM' && digits.length === 9 && /^[26]/.test(digits)) {
    return `+237${digits}`;
  }

  if (digits.length === pays.phoneDigitsNational) {
    return `${pays.indicatif}${digits}`;
  }

  if (String(raw || '').trim().startsWith('+')) {
    return `+${digits}`;
  }

  return `${pays.indicatif}${digits}`;
};

const validerTelephonePays = (raw, paysCode = 'CM') => {
  const pays = getPays(paysCode);
  const digitsOnly = String(raw || '').replace(/\D/g, '');
  const cc = pays.indicatif.replace('+', '');

  // Indicatif seul ou vide → pas de numéro
  if (!digitsOnly || digitsOnly === cc) {
    return null;
  }

  const normalized = normalizeTelephonePays(raw, paysCode);
  const digits = normalized.replace(/\D/g, '');

  if (!digits.startsWith(cc)) {
    const error = new Error(`Numéro invalide pour ${pays.label} (indicatif ${pays.indicatif})`);
    error.statusCode = 400;
    throw error;
  }

  const national = digits.slice(cc.length);
  if (national.length < pays.phoneDigitsNational - 1 || national.length > pays.phoneDigitsNational + 1) {
    const error = new Error(`Numéro incomplet — format attendu : ${pays.phonePlaceholder}`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
};

const validerNumeroOrdre = (numero, typeProfil, paysCode = 'CM') => {
  const pays = getPays(paysCode);
  const cfg = pays.ordre?.[typeProfil];
  const value = String(numero || '').trim();

  if (!cfg) {
    return value || null;
  }

  if (!value) {
    if (cfg.optional) return null;
    const error = new Error(`${cfg.label} obligatoire (${pays.label})`);
    error.statusCode = 400;
    throw error;
  }

  if (cfg.pattern && !cfg.pattern.test(value.replace(/\s/g, ''))) {
    const error = new Error(
      `${cfg.label} invalide pour ${pays.label}`
      + (cfg.example ? ` — ex. ${cfg.example}` : '')
      + (cfg.hint ? ` (${cfg.hint})` : ''),
    );
    error.statusCode = 400;
    throw error;
  }

  return value.replace(/\s/g, '');
};

module.exports = {
  PAYS_INSCRIPTION,
  listPays,
  getPays,
  normalizeTelephonePays,
  validerTelephonePays,
  validerNumeroOrdre,
};
