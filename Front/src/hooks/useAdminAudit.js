import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useAdminAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.auditLogs, { params });
      return data.data;
    },
  });
}
