/**
 * Références santé & urgences — République du Cameroun
 * Numéros officiels / largement utilisés au Cameroun
 */
const EMERGENCY = {
  national: { number: '112', label: 'Urgences nationales (gratuit)' },
  medical: { number: '1515', label: 'Urgences médicales / SAMU' },
  fire: { number: '119', label: 'Sapeurs-pompiers' },
  police: { number: '117', label: 'Police' },
  gendarmerie: { number: '118', label: 'Gendarmerie nationale' },
};

const EMERGENCY_CALL_TO_ACTION = `Appelez le **${EMERGENCY.national.number}** (urgences) ou le **${EMERGENCY.medical.number}** (urgences médicales) immédiatement.`;

const EMERGENCY_LINES_TEXT = [
  `${EMERGENCY.national.number} — ${EMERGENCY.national.label}`,
  `${EMERGENCY.medical.number} — ${EMERGENCY.medical.label}`,
  `${EMERGENCY.fire.number} — ${EMERGENCY.fire.label}`,
  `${EMERGENCY.police.number} — ${EMERGENCY.police.label}`,
  `${EMERGENCY.gendarmerie.number} — ${EMERGENCY.gendarmerie.label}`,
].join('\n');

const REFERENCE_HOSPITALS = [
  'Hôpital Central de Yaoundé',
  'Hôpital Général de Yaoundé',
  'Hôpital Laquintinie (Douala)',
  'CHU de Douala',
  'Hôpital de district de votre ville',
];

const EMERGENCY_REPLY = `🚨 **URGENCE VITALE — CAMEROUN**

${EMERGENCY_CALL_TO_ACTION}
Rendez-vous aux **urgences** de l'hôpital le plus proche (CHU, hôpital de district ou hôpital de référence de votre ville).

**Numéros utiles au Cameroun :**
${EMERGENCY_LINES_TEXT}

En attendant les secours :
- Asseyez-vous ou allongez-vous, tête légèrement surélevée si possible
- Desserrez vêtements serrés (col, ceinture)
- Aérez la pièce
- Ne restez pas seul
- Si vous avez un inhalateur (asthme), utilisez-le selon votre protocole habituel

🔴 **Urgences immédiates** — ne perdez pas de temps. Au Cameroun, le **${EMERGENCY.national.number}** et le **${EMERGENCY.medical.number}** sont gratuits depuis un mobile.`;

module.exports = {
  COUNTRY: 'Cameroun',
  CURRENCY: 'FCFA (XAF)',
  REGULATOR: 'MINSANTE',
  REGIONS: ['Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord', 'Adamaoua', 'Est', 'Sud', 'Sud-Ouest', 'Nord-Ouest'],
  MAJOR_CITIES: ['Yaoundé', 'Douala', 'Garoua', 'Bafoussam', 'Bamenda', 'Maroua', 'Ngaoundéré'],
  EMERGENCY,
  EMERGENCY_CALL_TO_ACTION,
  EMERGENCY_LINES_TEXT,
  REFERENCE_HOSPITALS,
  EMERGENCY_REPLY,
};
