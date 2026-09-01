import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function usePrisesToday() {
    return useQuery({
        queryKey: ['prises', 'today'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.prises.aujourdhui);
            return data.data || data.prises || data;
        },
        refetchInterval: 60000, // Refresh every minute
    });
}

export function usePrisesHistory(params = {}) {
    return useQuery({
        queryKey: ['prises', 'history', params],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.prises.history, { params });
            return data.data || data.historique || data;
        },
    });
}

export function useConfirmerPrise() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, statut = 'pris', date_heure_reelle = null }) => {
            if (!navigator.onLine) {
                const { enqueueOfflineAction } = await import('../utils/offlineQueue');
                enqueueOfflineAction({
                    type: 'confirmer_prise',
                    priseId: id,
                    statut,
                    date_heure_reelle,
                });
                return { offline: true };
            }
            const { data } = await client.post(ENDPOINTS.prises.confirmer(id), {
                statut,
                ...(date_heure_reelle ? { date_heure_reelle } : {}),
            });
            return data;
        },
        onSuccess: (data) => {
            if (!data?.offline) {
                queryClient.invalidateQueries({ queryKey: ['prises'] });
                queryClient.invalidateQueries({ queryKey: ['stats'] });
            }
        },
    });
}

export function useSkipPrise() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.post(ENDPOINTS.prises.confirmer(id), {
                statut: 'reporte',
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prises'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
}
