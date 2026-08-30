/**
 * Ressources premiers secours & sensibilisation — Cameroun
 * Vidéos éducatives (pas de contenu violent)
 */
const FIRST_AID_VIDEOS = {
  accident_route: {
    title: 'Accident de la route — que faire en tant que témoin ?',
    url: 'https://www.youtube.com/watch?v=8Y3sH8V6bZM',
    embedId: '8Y3sH8V6bZM',
    duration: '3 min',
    source: 'Croix-Rouge française',
  },
  pls: {
    title: 'Position latérale de sécurité (PLS)',
    url: 'https://www.youtube.com/watch?v=GmqXqwSV3bo',
    embedId: 'GmqXqwSV3bo',
    duration: '2 min',
    source: 'Croix-Rouge française',
  },
  hemorragie: {
    title: 'Stopper une hémorragie — compression',
    url: 'https://www.youtube.com/watch?v=NxO5LvgQzt2',
    embedId: 'NxO5LvgQzt2',
    duration: '2 min',
    source: 'Croix-Rouge française',
  },
  brulure: {
    title: 'Premiers soins — brûlure',
    url: 'https://www.youtube.com/watch?v=TLyy9MMB6s4',
    embedId: 'TLyy9MMB6s4',
    duration: '2 min',
    source: 'Croix-Rouge française',
  },
  rcr: {
    title: 'Massage cardiaque adulte',
    url: 'https://www.youtube.com/watch?v=YQCPv6K2d3o',
    embedId: 'YQCPv6K2d3o',
    duration: '3 min',
    source: 'Croix-Rouge française',
  },
};

const VIOLENCE_AWARENESS = {
  title: 'Violence & protection des femmes — Cameroun',
  message: `Si vous ou une proche êtes en danger **immédiat**, appelez le **117** (police) ou le **112** (urgences).

**Numéros utiles :**
- **1515** — urgences médicales
- **117** — police
- **118** — gendarmerie

Vous n'êtes pas seule. Un médecin (gynécologue, médecin généraliste) ou une structure de santé peut vous orienter en toute confidentialité sur DjamSanté.`,
  helplines: ['112', '117', '118', '1515'],
};

const ACCIDENT_WITNESS_STEPS = [
  'Sécuriser la zone : balises, feux de détresse, gants si possible',
  'Appeler le **112** ou le **1515** — décrire le lieu précis (quartier, repère)',
  'Ne pas déplacer une victime sauf danger immédiat (incendie, explosion)',
  'Vérifier conscience et respiration ; PLS si inconscient mais respire',
  'Compression ferme sur une plaie qui saigne abondamment',
  'Rassurer la victime, la couvrir, attendre les secours',
];

/** Protocoles pas-à-pas selon le type d'accident (mode témoin) */
const ACCIDENT_PROTOCOLS = {
  route: {
    type: 'route',
    titre: 'Accident de la route — protocole témoin',
    urgence: '112 ou 1515',
    etapes: [
      { numero: 1, titre: 'Sécuriser', detail: 'Allumez les warnings, placez un triangle à 30 m, mettez un gilet si possible. Coupez le contact des véhicules si sans danger.' },
      { numero: 2, titre: 'Alerter', detail: 'Appelez le 112 ou 1515. Indiquez : lieu précis (quartier, repère), nombre de blessés, état apparent.' },
      { numero: 3, titre: 'Ne pas déplacer', detail: 'Sauf danger immédiat (incendie, chute dans l\'eau). Un mauvais déplacement peut aggraver une fracture cervicale.' },
      { numero: 4, titre: 'Évaluer', detail: 'La victime répond-elle ? Respire-t-elle normalement ? Saigne-t-elle abondamment ?' },
      { numero: 5, titre: 'Agir', detail: 'Inconscient + respire → position latérale de sécurité (PLS). Hémorragie → compression ferme 10 min minimum.' },
      { numero: 6, titre: 'Rassurer', detail: 'Parlez calmement à la victime, couvrez-la, ne lui donnez rien à boire. Attendez les secours.' },
    ],
  },
  chute: {
    type: 'chute',
    titre: 'Chute grave — protocole',
    urgence: '112 ou 1515',
    etapes: [
      { numero: 1, titre: 'Ne pas bouger la victime', detail: 'Surtout si chute de hauteur ou douleur au cou/dos. Immobilisation jusqu\'aux secours.' },
      { numero: 2, titre: 'Alerter', detail: 'Appelez le 112 ou 1515. Décrivez la hauteur de chute et l\'état de conscience.' },
      { numero: 3, titre: 'Contrôler les saignements', detail: 'Compression directe sur la plaie avec un tissu propre.' },
      { numero: 4, titre: 'Surveiller', detail: 'Vérifiez la respiration toutes les minutes. PLS si perte de conscience.' },
    ],
  },
  brulure: {
    type: 'brulure',
    titre: 'Brûlure — premiers gestes',
    urgence: '1515 si étendue ou visage',
    etapes: [
      { numero: 1, titre: 'Refroidir', detail: 'Eau tiède (15-20°C) pendant 15-20 minutes. Pas de glace directe.' },
      { numero: 2, titre: 'Retirer bijoux', detail: 'Avant que l\'œdème ne gonfle, sans enlever les vêtements collés à la peau.' },
      { numero: 3, titre: 'Couvrir', detail: 'Film alimentaire propre ou compresse stérile humide. Ne pas percer les cloques.' },
      { numero: 4, titre: 'Consulter', detail: 'Brûlure > paume de main, visage, mains, pieds, ou enfant → urgences.' },
    ],
  },
  default: {
    type: 'general',
    titre: 'Accident — gestes de premier secours',
    urgence: '112 ou 1515',
    etapes: ACCIDENT_WITNESS_STEPS.map((s, i) => ({
      numero: i + 1,
      titre: `Étape ${i + 1}`,
      detail: s.replace(/\*\*/g, ''),
    })),
  },
};

const detectAccidentType = (message) => {
  const text = message.toLowerCase();
  if (/route|voiture|moto|collision|renvers/.test(text)) return 'route';
  if (/chute|tombe|tombé/.test(text)) return 'chute';
  if (/br[uû]l/.test(text)) return 'brulure';
  return 'default';
};

const getAccidentProtocol = (message) => {
  const type = detectAccidentType(message);
  return ACCIDENT_PROTOCOLS[type] || ACCIDENT_PROTOCOLS.default;
};

module.exports = {
  FIRST_AID_VIDEOS,
  VIOLENCE_AWARENESS,
  ACCIDENT_WITNESS_STEPS,
  ACCIDENT_PROTOCOLS,
  detectAccidentType,
  getAccidentProtocol,
};
