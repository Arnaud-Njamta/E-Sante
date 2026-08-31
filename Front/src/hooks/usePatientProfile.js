import { useMutation } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export function useUploadPatientPhoto() {
  const { fetchProfile } = useAuth();

  return useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await client.post(ENDPOINTS.patients.mePhoto, fd);
      return data.data;
    },
    onSuccess: async () => {
      await fetchProfile();
    },
  });
}
