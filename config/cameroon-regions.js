/** Régions administratives du Cameroun */
const CAMEROON_REGIONS = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
  'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
];

const VILLES_PAR_REGION = {
  Adamaoua: ['Ngaoundéré', 'Meiganga', 'Banyo'],
  Centre: ['Yaoundé', 'Mbalmayo', 'Obala', 'Eseka'],
  Est: ['Bertoua', 'Abong-Mbang', 'Batouri'],
  'Extrême-Nord': ['Maroua', 'Kousséri', 'Mokolo'],
  Littoral: ['Douala', 'Edéa', 'Nkongsamba'],
  Nord: ['Garoua', 'Guider', 'Poli'],
  'Nord-Ouest': ['Bamenda', 'Kumbo', 'Wum'],
  Ouest: ['Bafoussam', 'Dschang', 'Mbouda'],
  Sud: ['Ebolowa', 'Kribi', 'Sangmélima'],
  'Sud-Ouest': ['Buea', 'Limbe', 'Kumba'],
};

module.exports = { CAMEROON_REGIONS, VILLES_PAR_REGION };
