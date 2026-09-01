import React, { useState } from 'react';
import styled from 'styled-components';
import { Siren, Plus, Send } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import toast from 'react-hot-toast';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const AlerteItem = styled(Card)`
  padding: 14px 16px;
  border-left: 4px solid ${({ $p }) => (
    $p === 'critique' ? '#DC2626' : $p === 'attention' ? '#D97706' : '#2563EB'
  )};

  h4 { margin: 0 0 4px; font-size: 0.95rem; }
  p { margin: 0; font-size: 0.82rem; color: #64748B; }
  .meta { font-size: 0.72rem; color: #94A3B8; margin-top: 6px; }
`;

const PRIORITES = ['info', 'attention', 'critique'];

export default function AdminAlertesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titre: '', contenu: '', region: '', priorite: 'attention', expire_at: '',
  });

  const { data: regions } = useQuery({
    queryKey: ['admin', 'regions'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.regions);
      return data.data;
    },
  });

  const { data: alertes, isLoading } = useQuery({
    queryKey: ['admin', 'alertes'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.admin.alertes);
      return data.data;
    },
  });

  const creer = useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(ENDPOINTS.admin.alertes, payload);
      return data.data;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin', 'alertes'] });
      toast.success(`Alerte publiée — ${res.push?.sent || 0} notification(s) push envoyée(s)`);
      setShowForm(false);
      setForm({ titre: '', contenu: '', region: '', priorite: 'attention', expire_at: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const list = Array.isArray(alertes) ? alertes : [];

  if (isLoading) return <Spinner text="Chargement…" />;

  return (
    <>
      <PageHeader
        title="Alertes sanitaires"
        subtitle="Diffusion MINSANTE — notifications push aux patients"
        icon={<Siren size={24} />}
      />

      <Button onClick={() => setShowForm(!showForm)}>
        <Plus size={16} /> Nouvelle alerte
      </Button>

      {showForm && (
        <Card style={{ padding: 24, marginTop: 16, maxWidth: 560 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              creer.mutate({
                ...form,
                region: form.region || null,
                expire_at: form.expire_at || null,
              });
            }}
            style={{ display: 'grid', gap: 12 }}
          >
            <Input label="Titre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
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
              Région (vide = nationale)
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 8 }}
              >
                <option value="">Tout le Cameroun</option>
                {(regions || []).map((r) => <option key={r} value={r}>{r}</option>)}
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
            <Input label="Expiration (optionnel)" type="datetime-local" value={form.expire_at} onChange={(e) => setForm({ ...form, expire_at: e.target.value })} />
            <Button type="submit" disabled={creer.isPending}>
              <Send size={14} /> Publier & notifier
            </Button>
          </form>
        </Card>
      )}

      <List>
        {list.map((a) => (
          <AlerteItem key={a.id} $p={a.priorite}>
            <h4>{a.titre}</h4>
            <p>{a.contenu}</p>
            <div className="meta">
              {a.region || 'National'} · {a.priorite} · {new Date(a.createdAt).toLocaleString('fr-FR')}
            </div>
          </AlerteItem>
        ))}
        {list.length === 0 && <p style={{ color: '#94A3B8', fontStyle: 'italic' }}>Aucune alerte publiée</p>}
      </List>
    </>
  );
}
