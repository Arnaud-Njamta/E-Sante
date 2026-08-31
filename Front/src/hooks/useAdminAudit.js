import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

const adminQueryOptions = {
  staleTime: 0,
  gcTime: 30_000,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: 15_000,
};

export function useAdminAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.auditLogs, {
        params: { ...params, _t: Date.now() },
        headers: { 'Cache-Control': 'no-cache' },
      });
      return data.data;
    },
    ...adminQueryOptions,
  });
}
