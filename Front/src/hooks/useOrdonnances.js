import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useOrdonnances() {
    return useQuery({
        queryKey: ['ordonnances'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.ordonnances.base);
            return data.data || data.ordonnances || data;
        },
    });
}

export function useScanOrdonnance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await client.post(ENDPOINTS.ordonnances.scan, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ordonnances'] }),
    });
}

export function useValiderOrdonnance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, corrections }) => {
            const { data } = await client.post(ENDPOINTS.ordonnances.valider(id), corrections);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ordonnances'] });
            queryClient.invalidateQueries({ queryKey: ['traitements'] });
        },
    });
}
