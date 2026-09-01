import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setSupported(ok);
    if (!ok) return;

    client.get(ENDPOINTS.notifications.pushVapidKey)
      .then(({ data }) => setConfigured(!!data.data?.configured))
      .catch(() => setConfigured(false));
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported || loading) return false;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return false;

      const { data: vapidRes } = await client.get(ENDPOINTS.notifications.pushVapidKey);
      const publicKey = vapidRes.data?.publicKey;
      if (!publicKey) return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await client.post(ENDPOINTS.notifications.pushSubscribe, {
        subscription: sub.toJSON(),
      });
      setSubscribed(true);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [supported, loading]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await client.post(ENDPOINTS.notifications.pushUnsubscribe, { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch {
      // ignore
    }
  }, [supported]);

  return { supported, subscribed, loading, configured, subscribe, unsubscribe };
}
