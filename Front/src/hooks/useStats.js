import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useObservanceStats(params = {}) {
    return useQuery({
        queryKey: ['stats', 'observance', params],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.statistiques.observance, { params });
            return data.data || data;
        },
    });
}

export function useTendances() {
    return useQuery({
        queryKey: ['stats', 'tendances'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.statistiques.tendances);
            return data.data || data;
        },
    });
}

export function useRisques() {
    return useQuery({
        queryKey: ['stats', 'risques'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.statistiques.risque);
            return data.data || data;
        },
    });
}
