import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useCarnetPatient(patientId, enabled = true) {
  return useQuery({
    queryKey: ['carnet-medical', 'patient', patientId],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.medecins.carnetPatient(patientId));
      return data.data;
    },
    enabled: !!patientId && enabled,
    retry: false,
  });
}

export function useUpdateCarnetPatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ patientId, payload }) => {
      const { data } = await client.put(ENDPOINTS.medecins.carnetPatient(patientId), payload);
      return data.data;
    },
    onSuccess: (_, { patientId }) => {
      qc.invalidateQueries({ queryKey: ['carnet-medical', 'patient', patientId] });
    },
  });
}
