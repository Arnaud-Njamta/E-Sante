const { ACCIDENT_PROTOCOLS, FIRST_AID_VIDEOS } = require('./ai-first-aid');
const { EMERGENCY } = require('./cameroon-health');

/** Types d'urgence — signature DjamSanté */
const URGENCE_TYPES = [
  { id: 'accident', label: 'Accident', emoji: '🚗', serviceCategories: ['Urgence', 'Chirurgie'], protocolKey: 'route' },
  { id: 'malaise', label: 'Malaise', emoji: '😵', serviceCategories: ['Urgence'], protocolKey: 'malaise' },
  { id: 'brulure', label: 'Brûlure', emoji: '🔥', serviceCategories: ['Urgence'], protocolKey: 'brulure' },
  { id: 'allergie', label: 'Réaction allergique', emoji: '🤧', serviceCategories: ['Urgence'], protocolKey: 'allergie' },
  { id: 'saignement', label: 'Saignement', emoji: '🩸', serviceCategories: ['Urgence', 'Chirurgie'], protocolKey: 'saignement', videoKey: 'hemorragie' },
  { id: 'respiration', label: 'Difficulté à respirer', emoji: '🫁', serviceCategories: ['Urgence'], protocolKey: 'respiration' },
  { id: 'inconscience', label: 'Inconscience', emoji: '😶', serviceCategories: ['Urgence'], protocolKey: 'inconscience', videoKey: 'pls' },
  { id: 'autre', label: 'Autre urgence', emoji: '🚨', serviceCategories: ['Urgence'], protocolKey: 'default' },
];

const CAPACITES_HOPITAL = [
  { id: 'Urgence', label: 'Urgences adultes', icon: '🏥' },
  { id: 'Maternité', label: 'Maternité', icon: '🤰' },
  { id: 'Pédiatrie', label: 'Pédiatrie', icon: '👶' },
  { id: 'Chirurgie', label: 'Chirurgie', icon: '🔪' },
  { id: 'Imagerie', label: 'Imagerie', icon: '📷' },
  { id: 'Analyses', label: 'Laboratoire', icon: '🔬' },
];

const getProtocole = (typeId) => {
  const t = URGENCE_TYPES.find((x) => x.id === typeId);
  const key = t?.protocolKey || 'default';
  const protocol = ACCIDENT_PROTOCOLS[key] || ACCIDENT_PROTOCOLS.default;
  const video = t?.videoKey ? FIRST_AID_VIDEOS[t.videoKey] : null;
  return {
    type: t,
    protocole: protocol,
    video,
    numeros: [
      { label: 'Urgences nationales', numero: EMERGENCY.national.number },
      { label: 'SAMU / Urgences médicales', numero: EMERGENCY.medical.number },
      { label: 'Pompiers', numero: EMERGENCY.fire?.number || '118' },
    ],
  };
};

module.exports = {
  URGENCE_TYPES,
  CAPACITES_HOPITAL,
  getProtocole,
};
