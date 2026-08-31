import React, { useState } from 'react';
import { Users, Plus, Trash2, Mail } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/ui/PageHeader';
import { useStructureEquipe, useCreerMembreEquipe, useSupprimerMembreEquipe } from '../hooks/useProfilPro';
import toast from 'react-hot-toast';

const EMPTY = { nom: '', prenom: '', role: 'Pharmacien', email: '', telephone: '', bio: '' };

export default function StructureEquipePage() {
  const { data: membres, isLoading, refetch } = useStructureEquipe();
  const creer = useCreerMembreEquipe();
  const supprimer = useSupprimerMembreEquipe();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [compInput, setCompInput] = useState('');
  const [competences, setCompetences] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creer.mutateAsync({ ...form, competences });
      toast.success('Membre ajouté à l\'équipe');
      setForm(EMPTY);
      setCompetences([]);
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Équipe & profils"
        subtitle="Présentez votre équipe réelle — visible sur votre fiche établissement dans l'annuaire."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> Ajouter un membre</Button>
      </div>

      {showForm && (
        <Card style={{ padding: 24, marginBottom: 20 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Prénom *" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
              <Input label="Nom *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
              <Input label="Rôle *" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Pharmacien titulaire, Préparateur..." required />
              <Input label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ gridColumn: '1 / -1' }} />
            </div>
            <textarea
              placeholder="Bio courte (parcours, spécialités...)"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={2}
              style={{ width: '100%', marginTop: 12, padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input
                value={compInput}
                onChange={(e) => setCompInput(e.target.value)}
                placeholder="Compétence (Entrez pour ajouter)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const c = compInput.trim();
                    if (c && !competences.includes(c)) { setCompetences([...competences, c]); setCompInput(''); }
                  }
                }}
                style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }}
              />
            </div>
            {competences.length > 0 && (
              <p style={{ fontSize: '0.82rem', marginTop: 8 }}>{competences.join(' · ')}</p>
            )}
            <Button type="submit" style={{ marginTop: 16 }} disabled={creer.isPending}>Enregistrer</Button>
          </form>
        </Card>
      )}

      {!membres?.length ? (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <Users size={32} style={{ marginBottom: 12 }} />
          <p>Aucun membre d&apos;équipe pour le moment.</p>
        </Card>
      ) : membres.map((m) => (
        <Card key={m.id} style={{ padding: 18, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 4px' }}>{m.prenom} {m.nom}</h3>
              <p style={{ margin: 0, color: '#0F766E', fontWeight: 600, fontSize: '0.85rem' }}>{m.role}</p>
              {m.bio && <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#64748B' }}>{m.bio}</p>}
              {m.email && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {m.email}</p>}
              {m.competences?.length > 0 && (
                <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>{m.competences.join(' · ')}</p>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={async () => { await supprimer.mutateAsync(m.id); toast.success('Membre retiré'); refetch(); }}>
              <Trash2 size={14} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
