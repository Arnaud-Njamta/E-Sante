/** Utilitaires géolocalisation — distance Haversine (km). */

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(Number(lat2) - Number(lat1));
  const dLon = toRad(Number(lon2) - Number(lon1));
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const parseGeoParams = ({
  latitude, longitude, nearby, radius_km = 25,
} = {}) => {
  const lat = latitude != null && latitude !== '' ? Number(latitude) : null;
  const lng = longitude != null && longitude !== '' ? Number(longitude) : null;
  const useGeo = Number.isFinite(lat) && Number.isFinite(lng)
    && (nearby === true || nearby === 'true' || nearby === '1');
  const radius = Number(radius_km) || 25;
  return { lat, lng, useGeo, radius };
};

const attachDistance = (item, lat, lng, getCoords) => {
  const coords = getCoords(item);
  if (!coords || coords.lat == null || coords.lng == null) return item;
  const distance_km = Math.round(haversineKm(lat, lng, coords.lat, coords.lng) * 10) / 10;
  return { ...item, distance_km };
};

const filterSortByDistance = (items, lat, lng, radiusKm, getCoords) => {
  const withDist = items
    .map((item) => attachDistance(item, lat, lng, getCoords))
    .filter((item) => item.distance_km != null && item.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
  return withDist;
};

module.exports = {
  haversineKm,
  parseGeoParams,
  attachDistance,
  filterSortByDistance,
};
