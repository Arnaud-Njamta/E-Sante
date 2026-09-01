import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useAlertesSanitaires(region) {
  return useQuery({
    queryKey: ['alertes-sanitaires', region || 'all'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.publications.alertes, {
        params: region ? { region } : {},
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
