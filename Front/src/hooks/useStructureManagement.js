import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useStructureMedecins() {
  return useQuery({
    queryKey: ['structure', 'medecins'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.etablissements.meMedecins);
      return data.data;
    },
  });
}

export function useAddStructureMedecin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.etablissements.meMedecins, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['structure'] });
    },
  });
}

export function useUpdateStructureMedecin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await client.put(ENDPOINTS.etablissements.medecinById(id), payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['structure'] });
    },
  });
}

export function useStructureServices() {
  return useQuery({
    queryKey: ['structure', 'services'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.etablissements.meServices);
      return data.data;
    },
  });
}

export function useCreateStructureService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.etablissements.meServices, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['structure'] });
    },
  });
}

export function useUpdateStructureService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await client.put(ENDPOINTS.etablissements.serviceById(id), payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['structure'] });
    },
  });
}

export function useDeleteStructureService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await client.delete(ENDPOINTS.etablissements.serviceById(id));
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['structure'] });
    },
  });
}

export function useStructureRendezVous(filters = {}) {
  return useQuery({
    queryKey: ['structure', 'rendez-vous', filters],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.etablissements.meRendezVous, { params: filters });
      return data.data;
    },
  });
}
