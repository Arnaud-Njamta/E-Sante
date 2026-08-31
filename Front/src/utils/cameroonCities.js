/** Villes principales du Cameroun — pour libellé et repli sans GPS */
export const CM_CITIES = [
  { name: 'Yaoundé', lat: 3.8667, lng: 11.5167 },
  { name: 'Douala', lat: 4.0511, lng: 9.7679 },
  { name: 'Bafoussam', lat: 5.4781, lng: 10.4178 },
  { name: 'Bamenda', lat: 5.9631, lng: 10.1591 },
  { name: 'Garoua', lat: 9.3014, lng: 13.3931 },
  { name: 'Maroua', lat: 10.5917, lng: 14.3158 },
  { name: 'Ngaoundéré', lat: 7.3167, lng: 13.5833 },
  { name: 'Bertoua', lat: 4.5833, lng: 14.0833 },
  { name: 'Ebolowa', lat: 2.9, lng: 11.15 },
  { name: 'Kribi', lat: 2.9373, lng: 9.9077 },
  { name: 'Limbe', lat: 4.0236, lng: 9.2065 },
  { name: 'Buéa', lat: 4.1534, lng: 9.2423 },
];

const toRad = (d) => (d * Math.PI) / 180;

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Ville camerounaise la plus proche des coordonnées */
export function nearestCameroonCity(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  let best = null;
  let bestDist = Infinity;
  CM_CITIES.forEach((c) => {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  });
  if (!best || bestDist > 120) return null;
  return { ...best, distance_km: Math.round(bestDist * 10) / 10 };
}

const GEO_KEY = 'esante_geo_v1';
const GEO_TTL_MS = 24 * 60 * 60 * 1000;

export function loadCachedGeo() {
  try {
    const raw = sessionStorage.getItem(GEO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.latitude || !parsed?.longitude) return null;
    if (Date.now() - (parsed.ts || 0) > GEO_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCachedGeo(coords) {
  try {
    sessionStorage.setItem(GEO_KEY, JSON.stringify({ ...coords, ts: Date.now() }));
  } catch { /* quota */ }
}
