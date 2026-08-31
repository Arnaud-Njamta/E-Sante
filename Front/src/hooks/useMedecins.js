import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useMedecins(filters = {}, options = {}) {
    return useQuery({
        queryKey: ['medecins', filters],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.medecins.base, { params: filters });
            return data.data;
        },
        enabled: options.enabled !== false,
    });
}

export function useMedecin(id) {
    return useQuery({
        queryKey: ['medecins', id],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.medecins.byId(id));
            return data.data;
        },
        enabled: !!id,
    });
}
