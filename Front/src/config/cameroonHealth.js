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

export const WELCOME_AI_PATIENT = `Bonjour, je suis **Dr. DjamSanté** 🇨🇲 — votre assistant santé au Cameroun.

Je vous écoute : décrivez ce qui vous arrive (malaise, accident dont vous êtes témoin, douleur, fièvre…). Je pose quelques questions si besoin, puis je vous guide et je peux **vous proposer un médecin** sur DjamSanté.

⚠️ Urgence vitale → **${EMERGENCY.national.number}** ou **${EMERGENCY.medical.number}** immédiatement.

Que puis-je faire pour vous aujourd'hui ?`;

export const WELCOME_AI_MEDECIN = `Bonjour Docteur 👨‍⚕️ — **Dr. DjamSanté** à votre service.

Je peux vous aider à structurer des conseils patients ou réfléchir à une orientation.

🔐 **Mode formation** : écrivez « je suis docteur alors voici ce que tu dois intégrer dans ton apprentissage : … » pour enrichir ma base de connaissances.

Comment puis-je vous assister ?`;

export const WELCOME_AI = WELCOME_AI_PATIENT;

export const EMERGENCY_FOOTER = `En cas d'urgence vitale au Cameroun : appelez le **${EMERGENCY.national.number}** ou le **${EMERGENCY.medical.number}**, ou rendez-vous aux urgences de l'hôpital le plus proche.`;

export const SUGGESTIONS_PATIENT = [
  'J\'ai assisté à un accident de route',
  'Quelqu\'un s\'est brûlé, que faire ?',
  'Fièvre depuis 2 jours chez mon enfant',
  'Besoin d\'aide / écoute',
];

export const SUGGESTIONS_MEDECIN = [
  'Conseils paludisme enfant',
  'Orientation hypertension',
  'je suis docteur alors voici ce que tu dois intégrer dans ton apprentissage :',
];

export const FEMINICIDE_BANNER = {
  title: 'Ensemble contre les violences faites aux femmes',
  subtitle: 'Vous n\'êtes pas seule — 117 · 112 · 1515',
};
