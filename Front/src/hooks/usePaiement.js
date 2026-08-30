import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function usePaiementConfig() {
  return useQuery({
    queryKey: ['paiements', 'config'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.paiements.config);
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useInitierPaiement() {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.paiements.initier, payload);
      return data.data;
    },
  });
}

export function useSimulerPaiement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, canal }) => {
      const { data } = await client.post(ENDPOINTS.paiements.simuler(id), { canal });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rendez-vous'] });
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['paiements'] });
    },
  });
}

export function usePaiementStatut(id, enabled = false) {
  return useQuery({
    queryKey: ['paiements', id, 'statut'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.paiements.statut(id));
      return data.data;
    },
    enabled: !!id && enabled,
    refetchInterval: enabled ? 3000 : false,
  });
}

export function useMesPaiements() {
  return useQuery({
    queryKey: ['paiements', 'liste'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.paiements.liste);
      return data.data;
    },
  });
}

export function useAdminFinance() {
  return useQuery({
    queryKey: ['admin', 'finance', 'resume'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.commissions.adminResume);
      return data.data;
    },
  });
}

export function useAdminTransactions(params = {}) {
  return useQuery({
    queryKey: ['admin', 'finance', 'transactions', params],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.commissions.adminTransactions, { params });
      return data.data;
    },
  });
}

export function useTraiterReversements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post(ENDPOINTS.commissions.adminReversements);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'finance'] });
    },
  });
}

export function getRecuUrl(transactionId) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('esante_access_token');
  return `${base}${ENDPOINTS.paiements.recu(transactionId)}?access_token=${token}`;
}
