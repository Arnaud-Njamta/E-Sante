import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

export function useOrdonnancesMedecin() {
    return useQuery({
        queryKey: ['ordonnances-elec', 'medecin'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.ordonnancesElec.medecin);
            return data.data;
        },
    });
}

export function useOrdonnancesPatient() {
    return useQuery({
        queryKey: ['ordonnances-elec', 'patient'],
        queryFn: async () => {
            const { data } = await client.get(ENDPOINTS.ordonnancesElec.patient);
            return data.data;
        },
    });
}

export function useCreerOrdonnanceElec() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await client.post(ENDPOINTS.ordonnancesElec.base, payload);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['ordonnances-elec'] }),
    });
}

export function useSignerOrdonnance() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.post(ENDPOINTS.ordonnancesElec.signer(id));
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['ordonnances-elec'] }),
    });
}

export function useUploadMedecinPhoto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append('photo', file);
            const { data } = await client.post(ENDPOINTS.medecins.mePhoto, fd);
            return data.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['medecin'] });
            qc.invalidateQueries({ queryKey: ['medecin', 'dashboard'] });
        },
    });
}

export function useUploadMedecinCachet() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append('cachet', file);
            const { data } = await client.post(ENDPOINTS.medecins.meCachet, fd);
            return data.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['medecin'] });
            qc.invalidateQueries({ queryKey: ['medecin', 'dashboard'] });
        },
    });
}

export function useUploadMedecinSignature() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append('signature', file);
            const { data } = await client.post(ENDPOINTS.medecins.meSignature, fd);
            return data.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['medecin'] });
            qc.invalidateQueries({ queryKey: ['medecin', 'dashboard'] });
        },
    });
}

export function useUpdateMedecinHoraires() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (horaires) => {
            const { data } = await client.put(ENDPOINTS.medecins.meHoraires, horaires);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['medecin'] }),
    });
}

export function useUpdateMedecinProfil() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await client.put(ENDPOINTS.medecins.meProfile, payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['medecin'] });
            qc.invalidateQueries({ queryKey: ['medecin', 'dashboard'] });
        },
    });
}

export function useUpdateEtabHoraires() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (horaires) => {
            const { data } = await client.put(ENDPOINTS.etablissements.meHoraires, horaires);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacie', 'dashboard'] }),
    });
}

export function useUpdateEtabLocalisation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (loc) => {
            const { data } = await client.put(ENDPOINTS.etablissements.meLocalisation, loc);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pharmacie', 'dashboard'] }),
    });
}

export function useUploadEtabPhoto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append('photo', file);
            const { data } = await client.post(ENDPOINTS.etablissements.mePhoto, fd);
            return data.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pharmacie', 'dashboard'] });
            qc.invalidateQueries({ queryKey: ['structure', 'dashboard'] });
        },
    });
}
