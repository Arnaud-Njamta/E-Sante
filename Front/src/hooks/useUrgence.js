import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useUrgenceTypes() {
  return useQuery({
    queryKey: ['urgence', 'types'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.urgence.types);
      return data.data;
    },
    staleTime: 300_000,
  });
}

export function useUrgenceProtocole(type) {
  return useQuery({
    queryKey: ['urgence', 'protocole', type],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.urgence.protocole(type));
      return data.data;
    },
    enabled: !!type,
  });
}

export function useUrgenceEtablissements(params, enabled = true) {
  return useQuery({
    queryKey: ['urgence', 'etablissements', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.urgence.etablissements, { params });
      return data.data;
    },
    enabled: enabled && !!params?.type_urgence,
    staleTime: 30_000,
  });
}

export function useMesDemandesPriseEnCharge() {
  return useQuery({
    queryKey: ['demandes-prise-en-charge', 'patient'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.demandes.mesDemandes);
      return data.data;
    },
  });
}

export function useCreerDemandePriseEnCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.demandes.base, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['demandes-prise-en-charge'] }),
  });
}

export function useDemandesEtablissement(filters = {}) {
  return useQuery({
    queryKey: ['demandes-prise-en-charge', 'etablissement', filters],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.demandes.etablissement, { params: filters });
      return data.data;
    },
  });
}

export function useRepondreDemande() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) => {
      const { data } = await client.put(ENDPOINTS.demandes.reponse(id), body);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['demandes-prise-en-charge'] }),
  });
}
