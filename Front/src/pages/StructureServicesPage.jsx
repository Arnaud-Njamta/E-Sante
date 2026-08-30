import React, { useState } from 'react';
import { Stethoscope, Plus, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import {
  useStructureServices, useCreateStructureService, useDeleteStructureService,
} from '../hooks/useStructureManagement';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Consultation', 'Hospitalisation', 'Chirurgie', 'Imagerie', 'Laboratoire',
  'Urgences', 'Maternité', 'Vaccination', 'Téléconsultation', 'Autre',
];

const EMPTY = { nom: '', description: '', categorie: 'Consultation', prix_indicatif: '', duree_minutes: '' };

export default function StructureServicesPage() {
  const { data: services, isLoading } = useStructureServices();
  const creer = useCreateStructureService();
  const supprimer = useDeleteStructureService();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creer.mutateAsync({
        ...form,
        prix_indicatif: form.prix_indicatif ? Number(form.prix_indicatif) : null,
        duree_minutes: form.duree_minutes ? Number(form.duree_minutes) : null,
      });
      toast.success('Service ajouté');
      setForm(EMPTY);
      setShowForm(false);
    } catch {
      toast.error('Erreur');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}><Stethoscope size={24} style={{ verticalAlign: 'middle' }} /> Services & tarifs</h1>
          <p style={{ color: '#64748B', margin: '4px 0 0' }}>
            Publiez vos actes médicaux avec les prix en FCFA — transparence exigée par la CSU camerounaise.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> Ajouter</Button>
      </div>

      {showForm && (
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Nom du service *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Catégorie</label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4 }}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Prix indicatif (FCFA) *" type="number" value={form.prix_indicatif} onChange={(e) => setForm({ ...form, prix_indicatif: e.target.value })} required />
              <Input label="Durée (minutes)" type="number" value={form.duree_minutes} onChange={(e) => setForm({ ...form, duree_minutes: e.target.value })} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4 }}
                placeholder="Détaillez ce que comprend la prestation..."
              />
            </div>
            <Button type="submit" style={{ marginTop: 16 }}>Enregistrer</Button>
          </form>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {(services || []).filter((s) => s.disponible !== false).map((s) => (
          <Card key={s.id} style={{ padding: 20 }}>
            <span style={{
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 8,
              background: '#F1F5F9', color: '#64748B',
            }}>
              {s.categorie}
            </span>
            <h3 style={{ margin: '8px 0 4px', fontSize: '1rem' }}>{s.nom}</h3>
            {s.description && <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 8px' }}>{s.description}</p>}
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>
              {s.prix_indicatif ? `${Number(s.prix_indicatif).toLocaleString()} FCFA` : 'Sur devis'}
            </p>
            {s.duree_minutes && <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>{s.duree_minutes} min</p>}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => supprimer.mutate(s.id)}
              style={{ marginTop: 12 }}
            >
              <Trash2 size={14} /> Retirer
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
