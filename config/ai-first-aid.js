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
  malaise: {
    type: 'malaise',
    titre: 'Malaise — que faire ?',
    urgence: '112 ou 1515',
    etapes: [
      { numero: 1, titre: 'Allonger', detail: 'Coucher la victime, surélever légèrement les jambes si possible (sauf blessure).' },
      { numero: 2, titre: 'Desserrer', detail: 'Vêtements serrés (ceinture, col). Aérer, éviter la foule.' },
      { numero: 3, titre: 'Surveiller', detail: 'Conscience, respiration, couleur des lèvres. Noter l\'heure du malaise.' },
      { numero: 4, titre: 'Alerter', detail: 'Si perte de conscience, douleur thoracique, confusion ou vomissements → appelez le 112 ou 1515.' },
      { numero: 5, titre: 'Ne pas donner', detail: 'Pas de boisson ni médicament si la victime est somnolente ou vomit.' },
    ],
  },
  allergie: {
    type: 'allergie',
    titre: 'Réaction allergique — gestes urgents',
    urgence: '112 ou 1515 — urgence vitale si gonflement gorge',
    etapes: [
      { numero: 1, titre: 'Éloigner l\'allergène', detail: 'Arrêter l\'exposition (aliment, piqûre, médicament).' },
      { numero: 2, titre: 'Auto-injecteur', detail: 'Si la victime a un stylo adrénaline (EpiPen), l\'utiliser selon la notice, cuisse externe.' },
      { numero: 3, titre: 'Alerter', detail: 'Gonflement visage/gorge, difficulté à respirer, urticaire généralisé → 112 immédiatement.' },
      { numero: 4, titre: 'Position', detail: 'Assise si essoufflement ; allongée jambes surélevées si malaise sans détresse respiratoire.' },
      { numero: 5, titre: 'Surveiller', detail: 'Rester avec la victime jusqu\'aux secours — une deuxième réaction peut survenir.' },
    ],
  },
  respiration: {
    type: 'respiration',
    titre: 'Difficulté à respirer — premiers gestes',
    urgence: '112 ou 1515',
    etapes: [
      { numero: 1, titre: 'Alerter', detail: 'Appelez le 112 ou 1515. Décrivez l\'âge, les symptômes et l\'heure de début.' },
      { numero: 2, titre: 'Position', detail: 'Assis, penché en avant, coudes sur les genoux — facilite la respiration.' },
      { numero: 3, titre: 'Desserrer', detail: 'Col, ceinture. Aérer la pièce, éloigner la foule.' },
      { numero: 4, titre: 'Inhalateur', detail: 'Si asthmatique connu : utiliser le bronchodilatateur (Ventoline) selon prescription.' },
      { numero: 5, titre: 'Surveiller', detail: 'Lèvres bleues, incapacité à parler, somnolence → préparer la RCP si arrêt respiratoire.' },
    ],
  },
  inconscience: {
    type: 'inconscience',
    titre: 'Inconscience — protocole',
    urgence: '112 ou 1515',
    etapes: [
      { numero: 1, titre: 'Alerter', detail: 'Appelez le 112 ou 1515 immédiatement.' },
      { numero: 2, titre: 'Vérifier la respiration', detail: 'Tête en arrière, regarder, écouter, sentir — max 10 secondes.' },
      { numero: 3, titre: 'PLS si respire', detail: 'Victime inconsciente mais qui respire → position latérale de sécurité. Surveiller en permanence.' },
      { numero: 4, titre: 'RCP si ne respire pas', detail: '30 compressions thoraciques puis 2 insufflations. Continuez jusqu\'à l\'arrivée des secours.' },
      { numero: 5, titre: 'Ne pas donner', detail: 'Rien à boire ni à manger. Ne pas secouer la victime.' },
    ],
  },
  saignement: {
    type: 'saignement',
    titre: 'Saignement abondant — stopper l\'hémorragie',
    urgence: '112 ou 1515',
    etapes: [
      { numero: 1, titre: 'Compression directe', detail: 'Appuyer fermement avec un tissu propre sur la plaie — maintenir 10 minutes minimum sans relâcher.' },
      { numero: 2, titre: 'Surélever', detail: 'Membre blessé au-dessus du cœur si possible, victime allongée.' },
      { numero: 3, titre: 'Garrot (extrême)', detail: 'Si saignement artériel massif et compression inefficace : garrot 5 cm au-dessus de la plaie, noter l\'heure.' },
      { numero: 4, titre: 'Alerter', detail: 'Appelez le 112 ou 1515. Signalez pâleur, faiblesse, confusion (choc).' },
      { numero: 5, titre: 'Réchauffer', detail: 'Couvrir la victime, rassurer, ne pas donner à boire.' },
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
