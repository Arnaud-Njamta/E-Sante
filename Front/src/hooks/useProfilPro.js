import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useMedecinAffiliations(params = {}) {
  return useQuery({
    queryKey: ['medecin', 'affiliations', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.medecins.meAffiliations, { params });
      return data.data;
    },
  });
}

export function useCreerCabinet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.medecins.meCabinet, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medecin', 'affiliations'] }),
  });
}

export function useRepondreAffiliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accepter }) => {
      const { data } = await client.post(ENDPOINTS.medecins.repondreAffiliation(id), { accepter });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medecin', 'affiliations'] }),
  });
}

export function useTerminerAffiliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await client.post(ENDPOINTS.medecins.terminerAffiliation(id));
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medecin', 'affiliations'] }),
  });
}

export function useMedecinParcours() {
  return useQuery({
    queryKey: ['medecin', 'parcours'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.medecins.meParcours);
      return data.data;
    },
  });
}

export function useCreerParcours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.medecins.meParcours, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medecin', 'parcours'] }),
  });
}

export function useSupprimerParcours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await client.delete(ENDPOINTS.medecins.parcoursById(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medecin', 'parcours'] }),
  });
}

export function useStructureAffiliations() {
  return useQuery({
    queryKey: ['structure', 'affiliations'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.etablissements.meAffiliations);
      return data.data;
    },
  });
}

export function useInviterMedecin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.etablissements.inviterMedecin, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['structure', 'affiliations'] });
      qc.invalidateQueries({ queryKey: ['structure', 'medecins'] });
    },
  });
}

export function useStructureEquipe() {
  return useQuery({
    queryKey: ['structure', 'equipe'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.etablissements.meEquipe);
      return data.data;
    },
  });
}

export function useCreerMembreEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.etablissements.meEquipe, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['structure', 'equipe'] }),
  });
}

export function useSupprimerMembreEquipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await client.delete(ENDPOINTS.etablissements.equipeById(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['structure', 'equipe'] }),
  });
}

export function useEtablissementEquipe(etablissementId) {
  return useQuery({
    queryKey: ['etablissement', etablissementId, 'equipe'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.etablissements.equipePublic(etablissementId));
      return data.data;
    },
    enabled: !!etablissementId,
  });
}
