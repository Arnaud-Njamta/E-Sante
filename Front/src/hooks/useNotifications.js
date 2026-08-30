import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.notifications.me);
      return data.data;
    },
    refetchInterval: 60_000,
  });
}
