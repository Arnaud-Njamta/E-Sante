import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useCarnetMedical() {
  return useQuery({
    queryKey: ['carnet-medical', 'me'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.carnetMedical.me);
      return data.data;
    },
  });
}

export function useTextesConsentement() {
  return useQuery({
    queryKey: ['carnet-medical', 'textes'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.carnetMedical.textes);
      return data.data;
    },
    staleTime: 3600_000,
  });
}

export function useUpdateCarnetMedical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.put(ENDPOINTS.carnetMedical.me, payload);
      return data.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['carnet-medical', 'me'], data);
      qc.invalidateQueries({ queryKey: ['carnet-medical'] });
    },
  });
}

export function useOrdonnanceDocument(id) {
  return useQuery({
    queryKey: ['ordonnance-doc', id],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.ordonnancesElec.document(id));
      return data.data;
    },
    enabled: !!id,
  });
}
