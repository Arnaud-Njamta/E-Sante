import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useTraitements() {
    return useQuery({
        queryKey: ['traitements'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.traitements.base);
            const result = data.data || data;
            return Array.isArray(result) ? result : result.traitements || [];
        },
    });
}

export function useTraitement(id) {
    return useQuery({
        queryKey: ['traitements', id],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.traitements.byId(id));
            const result = data.data || data;
            return result.traitement || result;
        },
        enabled: !!id,
    });
}

export function useCreateTraitement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await client.post(ENDPOINTS.traitements.base, payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['traitements'] }),
    });
}

export function useUpdateTraitement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...payload }) => {
            const { data } = await client.put(ENDPOINTS.traitements.byId(id), payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['traitements'] }),
    });
}

export function useDeleteTraitement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await client.delete(ENDPOINTS.traitements.byId(id));
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['traitements'] }),
    });
}
