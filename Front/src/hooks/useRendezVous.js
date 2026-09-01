import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

const invalidateRdvQueries = (qc) => {
    qc.invalidateQueries({ queryKey: ['rendez-vous'] });
    qc.invalidateQueries({ queryKey: ['notifications', 'me'] });
};

export function useCreneaux(medecinId, date, affiliationId = null) {
    return useQuery({
        queryKey: ['creneaux', medecinId, date, affiliationId],
        queryFn: async () => {
            const params = { date };
            if (affiliationId) params.affiliation_id = affiliationId;
            const { data } = await client.get(ENDPOINTS.medecins.creneaux(medecinId), { params });
            return data.data;
        },
        enabled: !!medecinId && !!date,
    });
}

export function useMesRendezVous() {
    return useQuery({
        queryKey: ['rendez-vous', 'patient'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.rendezVous.mesRdv);
            return data.data.rendez_vous;
        },
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    });
}

export function useRendezVousMedecin(params = {}) {
    return useQuery({
        queryKey: ['rendez-vous', 'medecin', params],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.rendezVous.medecin, { params });
            return data.data;
        },
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    });
}

export function useCreerRdv() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await client.post(ENDPOINTS.rendezVous.base, payload);
            return data;
        },
        onSuccess: () => invalidateRdvQueries(qc),
    });
}

export function useUpdateRdvStatut() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }) => {
            const { data } = await client.patch(ENDPOINTS.rendezVous.statut(id), body);
            return data;
        },
        onSuccess: () => invalidateRdvQueries(qc),
    });
}

export function useAnnulerRdv() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.delete(ENDPOINTS.rendezVous.annuler(id));
            return data;
        },
        onSuccess: () => invalidateRdvQueries(qc),
    });
}

export function usePreviewAnnulationRdv(id, enabled = false) {
    return useQuery({
        queryKey: ['rendez-vous', 'annulation-preview', id],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.rendezVous.annulationPreview(id));
            return data.data;
        },
        enabled: enabled && !!id,
        staleTime: 10_000,
    });
}

export function useProposerContreProposition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...body }) => {
            const { data } = await client.post(ENDPOINTS.rendezVous.contreProposition(id), body);
            return data;
        },
        onSuccess: () => invalidateRdvQueries(qc),
    });
}

export function useRepondreContreProposition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, accepter }) => {
            const { data } = await client.post(ENDPOINTS.rendezVous.reponseProposition(id), { accepter });
            return data;
        },
        onSuccess: () => invalidateRdvQueries(qc),
    });
}

export function useRendezVousById(id) {
    return useQuery({
        queryKey: ['rendez-vous', id],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.rendezVous.byId(id));
            return data.data;
        },
        enabled: !!id,
    });
}
