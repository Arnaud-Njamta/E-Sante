import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function usePublications(params = {}) {
    return useQuery({
        queryKey: ['publications', params],
        queryFn: async () => {
            const { data } = await client.get('/publications', { params });
            return data.data;
        },
    });
}

export function useFeaturedPublications() {
    return useQuery({
        queryKey: ['publications', 'featured'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/publications/featured`);
            return data.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function usePublicationComments(publicationId) {
    return useQuery({
        queryKey: ['publications', publicationId, 'comments'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/publications/${publicationId}/comments`);
            return data.data;
        },
        enabled: !!publicationId,
    });
}

export function useToggleLike() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.post(`/publications/${id}/like`);
            return data.data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['publications'] }),
    });
}

export function useAddComment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, contenu }) => {
            const { data } = await client.post(`/publications/${id}/comments`, { contenu });
            return data.data;
        },
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['publications'] });
            qc.invalidateQueries({ queryKey: ['publications', id, 'comments'] });
        },
    });
}

export function useCreerPublication() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ payload, image }) => {
            const fd = new FormData();
            fd.append('data', JSON.stringify(payload));
            if (image) fd.append('image', image);
            const { data } = await client.post('/publications', fd);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['publications'] }),
    });
}
