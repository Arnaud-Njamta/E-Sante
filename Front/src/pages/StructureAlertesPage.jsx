import React, { useState } from 'react';
import styled from 'styled-components';
import { Siren, Send } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCreerPublication } from '../hooks/usePublications';
import { useAuth } from '../context/AuthContext';
import { CAMEROON_REGIONS } from '../config/cameroonRegions';
import toast from 'react-hot-toast';

const PRIORITES = ['info', 'attention', 'critique'];

export default function StructureAlertesPage() {
  const { user } = useAuth();
  const creer = useCreerPublication();
  const [form, setForm] = useState({
    titre: '', contenu: '', region: user?.region || '', priorite: 'attention',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creer.mutateAsync({
        payload: {
          type: 'alerte_sanitaire',
          titre: form.titre,
          contenu: form.contenu,
          region: form.region || null,
          priorite: form.priorite,
          mis_en_avant: true,
        },
      });
      toast.success('Alerte sanitaire publiée — patients notifiés');
      setForm({ titre: '', contenu: '', region: user?.region || '', priorite: 'attention' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur publication');
    }
  };

  return (
    <>
      <PageHeader
        title="Alertes sanitaires"
        subtitle="Publiez une alerte pour les patients de votre région"
        icon={<Siren size={24} />}
      />

      <Card style={{ padding: 24, maxWidth: 560 }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <Input label="Titre de l'alerte" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
          <label style={{ fontSize: '0.82rem' }}>
            Message
            <textarea
              value={form.contenu}
              onChange={(e) => setForm({ ...form, contenu: e.target.value })}
              required
              rows={4}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}
            />
          </label>
          <label style={{ fontSize: '0.82rem' }}>
            Région ciblée
            <select
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8 }}
            >
              <option value="">Tout le Cameroun</option>
              {CAMEROON_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label style={{ fontSize: '0.82rem' }}>
            Priorité
            <select
              value={form.priorite}
              onChange={(e) => setForm({ ...form, priorite: e.target.value })}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8 }}
            >
              {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <Button type="submit" disabled={creer.isPending}>
            <Send size={14} /> Publier l&apos;alerte
          </Button>
        </form>
      </Card>
    </>
  );
}
