import React, { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useMesProduits, useCreerProduit, useDeleteProduit } from '../hooks/useProduits';
import { useAuth } from '../context/AuthContext';
import { resolveFileUrl } from '../components/ui/PhotoUploadCard';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'general', 'antalgique', 'antibiotique', 'antipaludéen', 'antidiabétique',
  'cardiologie', 'pédiatrie', 'matériel médical', 'vitamines', 'autre',
];

const ROLE_CONFIG = {
  pharmacie: {
    title: 'Catalogue produits',
    subtitle: 'Gérez votre stock — visible dans le chat et la recherche patients',
  },
  hopital: {
    title: 'Dispensaire hospitalier',
    subtitle: 'Médicaments disponibles au comptoir — visibles par les patients dans l\'annuaire',
  },
  clinique: {
    title: 'Dispensaire clinique',
    subtitle: 'Publiez vos médicaments en stock avec prix FCFA — vos patients les trouvent en ligne',
  },
};

export default function DispensaireProduitsPage() {
  const { role } = useAuth();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.pharmacie;
  const { data: produits, isLoading, error, refetch } = useMesProduits();
  const creer = useCreerProduit();
  const supprimer = useDeleteProduit();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nom: '', description: '', categorie: 'general', prix_fcfa: '',
    stock_disponible: '0', necessite_ordonnance: false,
  });
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    try {
      await creer.mutateAsync(fd);
      toast.success('Produit ajouté au catalogue');
      setShowForm(false);
      setForm({ nom: '', description: '', categorie: 'general', prix_fcfa: '', stock_disponible: '0', necessite_ordonnance: false });
      setImage(null);
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Erreur chargement produits" onRetry={refetch} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}><Package size={24} style={{ verticalAlign: 'middle' }} /> {config.title}</h1>
          <p style={{ color: '#64748B' }}>{config.subtitle}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> Ajouter</Button>
      </div>

      {showForm && (
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Nom du médicament *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required placeholder="ex. Paracétamol 500 mg" />
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
              <Input label="Prix (FCFA) *" type="number" value={form.prix_fcfa} onChange={(e) => setForm({ ...form, prix_fcfa: e.target.value })} required />
              <Input label="Stock disponible" type="number" value={form.stock_disponible} onChange={(e) => setForm({ ...form, stock_disponible: e.target.value })} />
            </div>
            <Input label="Description / DCI" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginTop: 12 }} placeholder="Dénomination commune, posologie..." />
            <label style={{ display: 'block', marginTop: 12 }}>
              <input type="checkbox" checked={form.necessite_ordonnance} onChange={(e) => setForm({ ...form, necessite_ordonnance: e.target.checked })} />
              {' '}Nécessite ordonnance médicale
            </label>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: '0.85rem' }}>Photo du produit</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ display: 'block', marginTop: 4 }} />
            </div>
            <Button type="submit" style={{ marginTop: 16 }} disabled={creer.isPending}>
              {creer.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {(produits || []).filter((p) => p.actif !== false).map((p) => (
          <Card key={p.id} style={{ padding: 16 }}>
            {resolveFileUrl(p.image_url, p.fichier_image_id) && (
              <img src={resolveFileUrl(p.image_url, p.fichier_image_id)} alt={p.nom} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
            )}
            <strong>{p.nom}</strong>
            {p.necessite_ordonnance && (
              <span style={{ marginLeft: 6, fontSize: '0.65rem', padding: '2px 6px', borderRadius: 8, background: '#FEF3C7', color: '#B45309' }}>
                Ordonnance
              </span>
            )}
            <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
              {p.prix_fcfa?.toLocaleString()} FCFA
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: p.stock_disponible > 0 ? '#64748B' : '#EF4444' }}>
              {p.stock_disponible > 0 ? `En stock : ${p.stock_disponible}` : 'Rupture de stock'}
            </p>
            <Button variant="secondary" size="sm" onClick={() => supprimer.mutate(p.id)} style={{ marginTop: 8 }}>
              <Trash2 size={14} /> Retirer
            </Button>
          </Card>
        ))}
      </div>

      {(!produits || produits.length === 0) && !showForm && (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <Package size={40} style={{ marginBottom: 12 }} />
          <p>Aucun médicament au catalogue. Ajoutez vos produits pour que les patients puissent les consulter.</p>
        </Card>
      )}
    </div>
  );
}
