import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

/** Options de rafraîchissement agressif pour le tableau de bord admin */
const adminQueryOptions = {
  staleTime: 0,
  gcTime: 30_000,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: 15_000,
};

export function useAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.overview, {
        headers: { 'Cache-Control': 'no-cache' },
        params: { _t: Date.now() },
      });
      return data.data;
    },
    ...adminQueryOptions,
  });
}

export function useAdminComptes(params = {}) {
  return useQuery({
    queryKey: ['admin', 'comptes', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.comptes, {
        params: { ...params, _t: Date.now() },
        headers: { 'Cache-Control': 'no-cache' },
      });
      return data.data;
    },
    ...adminQueryOptions,
  });
}

export function useAdminEtablissements(params = {}) {
  return useQuery({
    queryKey: ['admin', 'etablissements', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.etablissements, {
        params: { ...params, _t: Date.now() },
        headers: { 'Cache-Control': 'no-cache' },
      });
      return data.data;
    },
    ...adminQueryOptions,
  });
}
