import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Plus, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import {
  useMedecinServices,
  useCreateMedecinService,
  useDeleteMedecinService,
} from '../hooks/useProfessionnel';
import toast from 'react-hot-toast';

const CATEGORY_KEYS = [
  'consultation',
  'teleconsultation',
  'follow_up',
  'emergency',
  'surgery',
  'imaging',
  'lab',
  'vaccination',
  'pediatrics',
  'other',
];

const EMPTY = { nom: '', description: '', categorie: 'Consultation', prix_indicatif: '', duree_minutes: '' };

function formatFcfa(value) {
  if (value == null || value === '') return null;
  return `${Number(value).toLocaleString()} FCFA`;
}

export default function MedecinServicesPage() {
  const { t } = useTranslation();
  const { data: services, isLoading } = useMedecinServices();
  const creer = useCreateMedecinService();
  const supprimer = useDeleteMedecinService();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const categories = CATEGORY_KEYS.map((key) => ({
    value: t(`medecinServices.categories.${key}`),
    label: t(`medecinServices.categories.${key}`),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creer.mutateAsync({
        ...form,
        prix_indicatif: form.prix_indicatif ? Number(form.prix_indicatif) : null,
        duree_minutes: form.duree_minutes ? Number(form.duree_minutes) : null,
      });
      toast.success(t('medecinServices.saved'));
      setForm({ ...EMPTY, categorie: categories[0]?.value || 'Consultation' });
      setShowForm(false);
    } catch {
      toast.error(t('medecinServices.error'));
    }
  };

  if (isLoading) return <Spinner text={t('medecinServices.loading')} />;

  const activeServices = (services || []).filter((s) => s.disponible !== false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>
            <Stethoscope size={24} style={{ verticalAlign: 'middle' }} /> {t('medecinServices.title')}
          </h1>
          <p style={{ color: '#64748B', margin: '8px 0 0', maxWidth: 560, lineHeight: 1.55 }}>
            {t('medecinServices.subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={showForm ? undefined : Plus}>
          {showForm ? t('common.cancel') : t('medecinServices.add')}
        </Button>
      </div>

      {showForm && (
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem' }}>{t('medecinServices.new_service')}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <Input
                label={t('medecinServices.name_label')}
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t('medecinServices.category_label')}</label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4 }}
                >
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <Input
                label={t('medecinServices.price_label')}
                type="number"
                value={form.prix_indicatif}
                onChange={(e) => setForm({ ...form, prix_indicatif: e.target.value })}
                required
              />
              <Input
                label={t('medecinServices.duration_label')}
                type="number"
                value={form.duree_minutes}
                onChange={(e) => setForm({ ...form, duree_minutes: e.target.value })}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t('medecinServices.description_label')}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder={t('medecinServices.description_placeholder')}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4 }}
              />
            </div>
            <Button type="submit" style={{ marginTop: 16 }} disabled={creer.isPending}>
              {creer.isPending ? t('medecinServices.saving') : t('medecinServices.save')}
            </Button>
          </form>
        </Card>
      )}

      {activeServices.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title={t('medecinServices.empty_title')}
          description={t('medecinServices.empty_desc')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {activeServices.map((s) => (
            <Card key={s.id} style={{ padding: 20 }}>
              <span style={{
                fontSize: '0.7rem', padding: '4px 10px', borderRadius: 999,
                background: '#F1F5F9', color: '#64748B', fontWeight: 600,
              }}>
                {s.categorie}
              </span>
              <h3 style={{ margin: '10px 0 6px', fontSize: '1.05rem' }}>{s.nom}</h3>
              {s.description && (
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 10px', lineHeight: 1.5 }}>{s.description}</p>
              )}
              <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#059669' }}>
                {formatFcfa(s.prix_indicatif) || t('medecinServices.on_request')}
              </p>
              {s.duree_minutes && (
                <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                  {t('medecinServices.duration_value', { minutes: s.duree_minutes })}
                </p>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => supprimer.mutate(s.id)}
                style={{ marginTop: 14 }}
                disabled={supprimer.isPending}
              >
                <Trash2 size={14} /> {t('medecinServices.remove')}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
