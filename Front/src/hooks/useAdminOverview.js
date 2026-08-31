import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { adminQueryOptions } from '../config/queryDefaults';

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.overview);
      return data.data;
    },
    ...adminQueryOptions,
  });
}

export function useAdminComptes(params = {}) {
  return useQuery({
    queryKey: ['admin', 'comptes', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.comptes, { params });
      return data.data;
    },
    ...adminQueryOptions,
  });
}

export function useAdminEtablissements(params = {}) {
  return useQuery({
    queryKey: ['admin', 'etablissements', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.etablissements, { params });
      return data.data;
    },
    ...adminQueryOptions,
  });
}
