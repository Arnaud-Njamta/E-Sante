import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useInscriptionProfessionnel() {
    return useMutation({
        mutationFn: async ({ payload, files }) => {
            const formData = new FormData();
            formData.append('data', JSON.stringify(payload));
            Object.entries(files || {}).forEach(([key, file]) => {
                if (file) formData.append(key, file);
            });
            const { data } = await axios.post(`${API_BASE}${ENDPOINTS.inscriptions.professionnel}`, formData);
            return data;
        },
    });
}

export async function fetchDocumentsRequis() {
    const { data } = await axios.get(`${API_BASE}${ENDPOINTS.inscriptions.documentsRequis}`);
    return data.data;
}

export async function fetchStatutInscription(email, reference) {
    const { data } = await axios.post(`${API_BASE}${ENDPOINTS.inscriptions.statut}`, { email, reference });
    return data.data;
}

export function useInscriptionsEnAttente() {
    return useQuery({
        queryKey: ['inscriptions', 'admin', 'en-attente'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.inscriptions.adminEnAttente, {
                params: { _t: Date.now() },
                headers: { 'Cache-Control': 'no-cache' },
            });
            return data.data;
        },
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchInterval: 15_000,
    });
}

export function useValiderInscription() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.post(ENDPOINTS.inscriptions.valider(id));
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inscriptions'] });
            qc.invalidateQueries({ queryKey: ['admin'] });
        },
    });
}

export function useRejeterInscription() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, motif_rejet }) => {
            const { data } = await client.post(ENDPOINTS.inscriptions.rejeter(id), { motif_rejet });
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inscriptions'] });
            qc.invalidateQueries({ queryKey: ['admin'] });
        },
    });
}

export function usePreVerifierInscription() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.post(ENDPOINTS.inscriptions.preVerifier(id));
            return data.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['inscriptions'] });
            qc.invalidateQueries({ queryKey: ['admin'] });
        },
    });
}
