import { useQuery } from '@tanstack/react-query';
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
