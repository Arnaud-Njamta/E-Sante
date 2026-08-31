import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { notificationsPollOptions } from '../config/queryDefaults';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.notifications.me);
      return data.data;
    },
    ...notificationsPollOptions,
  });
}
