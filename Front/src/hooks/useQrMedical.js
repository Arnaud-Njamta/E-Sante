import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useQrMedical() {
  return useQuery({
    queryKey: ['qr-medical', 'me'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.qrMedical.me);
      return data.data;
    },
  });
}

export function useRegenererQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post(ENDPOINTS.qrMedical.regenerer);
      return data.data;
    },
    onSuccess: (data) => qc.setQueryData(['qr-medical', 'me'], data),
  });
}

export function useQrPublic(token) {
  return useQuery({
    queryKey: ['qr-medical', 'public', token],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.qrMedical.public(token));
      return data.data;
    },
    enabled: !!token,
    retry: false,
  });
}
