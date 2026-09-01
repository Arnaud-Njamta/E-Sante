import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { notificationsPollOptions } from '../config/queryDefaults';

function showBrowserNotification(title, body) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch {
    // ignore
  }
}

export function useNotifications() {
  const prevCountRef = useRef(0);
  const prevIdsRef = useRef(new Set());

  const query = useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.notifications.me);
      return data.data;
    },
    ...notificationsPollOptions,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const items = query.data?.items || [];
    const ids = new Set(items.map((i) => i.id));
    const newItems = items.filter((i) => !prevIdsRef.current.has(i.id));

    if (prevCountRef.current > 0 && newItems.length > 0) {
      const latest = newItems[0];
      showBrowserNotification(latest.title, latest.message);
    }

    prevCountRef.current = items.length;
    prevIdsRef.current = ids;
  }, [query.data]);

  return query;
}
