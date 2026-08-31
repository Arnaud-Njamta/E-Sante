/** Urgences, santé & thème Cameroun — DjamSanté */
export const CAMEROON_COLORS = {
  green: '#007A5E',
  red: '#CE1126',
  yellow: '#FCD116',
  greenDark: '#005C47',
  redDark: '#9B0D1C',
};

export const EMERGENCY = {
  national: { number: '112', label: 'Urgences nationales' },
  medical: { number: '1515', label: 'Urgences médicales' },
  fire: { number: '119', label: 'Pompiers' },
  police: { number: '117', label: 'Police' },
  gendarmerie: { number: '118', label: 'Gendarmerie' },
};

export const EMERGENCY_SHORT = `${EMERGENCY.national.number} ou ${EMERGENCY.medical.number}`;

export const WELCOME_AI_PATIENT = `Bonjour, je suis **Dr. DjamSanté** 🇨🇲.

Je recueille vos symptômes pour préparer une **synthèse utile à votre médecin**, puis je peux vous aider à **prendre rendez-vous**. Je ne prescrit pas de médicaments et je ne remplace pas une consultation.

⚠️ Urgence vitale → **${EMERGENCY.national.number}** ou **${EMERGENCY.medical.number}** immédiatement.

Que souhaitez-vous décrire aujourd'hui ?`;

export const WELCOME_AI_MEDECIN = `Bonjour Docteur 👨‍⚕️ — **Dr. DjamSanté** à votre service.

Je structure anamnèses et synthèses pour votre dossier — sans diagnostic définitif ni ordonnance.

🔐 **Mode formation** : « je suis docteur alors voici ce que tu dois intégrer dans ton apprentissage : … »

Comment puis-je vous assister ?`;

export const WELCOME_AI = WELCOME_AI_PATIENT;

export const EMERGENCY_FOOTER = `En cas d'urgence vitale au Cameroun : appelez le **${EMERGENCY.national.number}** ou le **${EMERGENCY.medical.number}**, ou rendez-vous aux urgences de l'hôpital le plus proche.`;

export const SUGGESTIONS_PATIENT = [
  'Fièvre depuis 2 jours — préparer ma synthèse',
  'Douleur persistante, je veux un RDV',
  'Aide pour décrire mes symptômes au médecin',
  'Besoin d\'écoute / orientation vers un praticien',
];

export const SUGGESTIONS_MEDECIN = [
  'Structurer une anamnèse patient',
  'Formater une synthèse clinique courte',
  'je suis docteur alors voici ce que tu dois intégrer dans ton apprentissage :',
];

export const FEMINICIDE_BANNER = {
  title: 'Ensemble contre les violences faites aux femmes',
  subtitle: 'Vous n\'êtes pas seule — 117 · 112 · 1515',
};
