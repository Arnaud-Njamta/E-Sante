import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadCachedGeo, saveCachedGeo, nearestCameroonCity,
} from '../utils/cameroonCities';

/**
 * Géolocalisation silencieuse — pas de message d'erreur technique affiché.
 * Utilise le cache session, puis GPS, puis estimation IP (Cameroun).
 */
export default function useGeolocation({ enabled = true } = {}) {
  const [coords, setCoords] = useState(() => (enabled ? loadCachedGeo() : null));
  const [cityLabel, setCityLabel] = useState(() => loadCachedGeo()?.city || null);
  const [loading, setLoading] = useState(enabled && !loadCachedGeo());
  const triedIp = useRef(false);

  const applyCoords = useCallback((lat, lng, source = 'gps') => {
    const city = nearestCameroonCity(lat, lng);
    const payload = {
      latitude: lat,
      longitude: lng,
      city: city?.name || null,
      source,
    };
    setCoords(payload);
    setCityLabel(city?.name || null);
    saveCachedGeo(payload);
    setLoading(false);
  }, []);

  const tryIpFallback = useCallback(async () => {
    if (triedIp.current) return;
    triedIp.current = true;
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(6000) });
      if (!res.ok) return;
      const data = await res.json();
      if (data.country_code !== 'CM' && data.country !== 'CM') return;
      const lat = Number(data.latitude);
      const lng = Number(data.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      applyCoords(lat, lng, 'ip');
    } catch {
      setLoading(false);
    }
  }, [applyCoords]);

  const refresh = useCallback(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.geolocation) {
      tryIpFallback();
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyCoords(pos.coords.latitude, pos.coords.longitude, 'gps');
      },
      () => {
        const cached = loadCachedGeo();
        if (cached?.latitude) {
          setCoords(cached);
          setCityLabel(cached.city || null);
          setLoading(false);
          return;
        }
        tryIpFallback();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300_000 },
    );
  }, [enabled, applyCoords, tryIpFallback]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  return {
    coords,
    cityLabel,
    loading,
    refresh,
    hasLocation: !!coords?.latitude,
  };
}
