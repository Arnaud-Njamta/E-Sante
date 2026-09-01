import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useFamilleProfils() {
  return useQuery({
    queryKey: ['famille', 'profils'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.famille.base);
      return data.data;
    },
  });
}

export function useCreerProfilFamille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.famille.base, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['famille'] }),
  });
}

export function useUpdateProfilFamille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await client.put(ENDPOINTS.famille.detail(id), payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['famille'] });
      qc.invalidateQueries({ queryKey: ['carnet-medical'] });
    },
  });
}

export function useSupprimerProfilFamille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await client.delete(ENDPOINTS.famille.detail(id));
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['famille'] }),
  });
}
