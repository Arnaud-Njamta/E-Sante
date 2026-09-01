import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const CACHE_KEY = 'djamsante_carnet_cache';

export function cacheCarnet(data) {
  if (!data) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }));
  } catch {
    // ignore quota
  }
}

export function getCachedCarnet() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persiste le carnet en cache local à chaque fetch réussi */
export function useCarnetOfflineCache(carnetData) {
  useEffect(() => {
    if (carnetData) cacheCarnet(carnetData);
  }, [carnetData]);
}

/** Hydrate React Query depuis le cache si hors-ligne */
export function useHydrateCarnetFromCache() {
  const qc = useQueryClient();
  useEffect(() => {
    if (navigator.onLine) return;
    const cached = getCachedCarnet();
    if (cached?.data) {
      qc.setQueryData(['carnet-medical', 'me'], cached.data);
    }
  }, [qc]);
}
