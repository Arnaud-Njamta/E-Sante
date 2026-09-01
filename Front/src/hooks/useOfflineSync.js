import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import {
  getOfflineQueue, removeFromQueue, isOnline,
} from '../utils/offlineQueue';

export function useOfflineSync() {
  const [pending, setPending] = useState(() => getOfflineQueue().length);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(() => {
    setPending(getOfflineQueue().length);
  }, []);

  const flushQueue = useCallback(async () => {
    if (!isOnline() || syncing) return;
    const queue = getOfflineQueue();
    if (!queue.length) return;

    setSyncing(true);
    let done = 0;
    for (const item of queue) {
      try {
        if (item.type === 'confirmer_prise') {
          await client.post(ENDPOINTS.prises.confirmer(item.priseId), {
            statut: item.statut || 'pris',
            ...(item.date_heure_reelle ? { date_heure_reelle: item.date_heure_reelle } : {}),
          });
          removeFromQueue(item.id);
          done += 1;
        }
      } catch {
        break;
      }
    }
    setSyncing(false);
    refreshCount();
    return done;
  }, [syncing, refreshCount]);

  useEffect(() => {
    const onOnline = () => { flushQueue(); };
    window.addEventListener('online', onOnline);
    if (isOnline()) flushQueue();
    return () => window.removeEventListener('online', onOnline);
  }, [flushQueue]);

  useEffect(() => {
    const interval = setInterval(refreshCount, 5000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  return { pending, syncing, flushQueue, refreshCount };
}
