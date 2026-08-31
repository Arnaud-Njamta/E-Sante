import React, { useState } from 'react';
import { Users, Plus, UserCheck, UserX } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { resolveFileUrl } from '../components/ui/PhotoUploadCard';
import {
  useStructureMedecins, useAddStructureMedecin, useUpdateStructureMedecin,
} from '../hooks/useStructureManagement';
import { useInviterMedecin, useStructureAffiliations } from '../hooks/useProfilPro';
import toast from 'react-hot-toast';

const EMPTY = {
  nom: '', prenom: '', specialite: '', numero_ordre: '', telephone: '',
  email: '', password: '', tarif_consultation_fcfa: '', bio: '',
};

const SPECIALITES_CM = [
  'Médecine générale', 'Pédiatrie', 'Gynécologie-obstétrique', 'Cardiologie',
  'Chirurgie générale', 'Dermatologie', 'Ophtalmologie', 'ORL', 'Radiologie',
  'Anesthésie-réanimation', 'Urologie', 'Neurologie', 'Psychiatrie', 'Autre',
];

export default function StructureMedecinsPage() {
  const { data: medecins, isLoading } = useStructureMedecins();
  const { data: affiliations } = useStructureAffiliations();
  const addMedecin = useAddStructureMedecin();
  const updateMedecin = useUpdateStructureMedecin();
  const inviter = useInviterMedecin();
  const [mode, setMode] = useState('liste');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedecin.mutateAsync({
        ...form,
        tarif_consultation_fcfa: form.tarif_consultation_fcfa ? Number(form.tarif_consultation_fcfa) : null,
      });
      toast.success('Médecin inscrit dans votre établissement');
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const toggleActif = async (m) => {
    try {
      await updateMedecin.mutateAsync({ id: m.id, actif: !m.actif });
      toast.success(m.actif ? 'Médecin désactivé' : 'Médecin réactivé');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await inviter.mutateAsync({ email: inviteEmail, message: inviteMessage });
      toast.success('Invitation envoyée — le médecin doit l\'accepter depuis son espace');
      setInviteEmail('');
      setInviteMessage('');
      setMode('liste');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}><Users size={24} style={{ verticalAlign: 'middle' }} /> Médecins affiliés</h1>
          <p style={{ color: '#64748B', margin: '4px 0 0' }}>
            Invitez des médecins déjà inscrits sur DjamSanté — affiliation vérifiée, pas de faux profils.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => { setMode('inviter'); setShowForm(false); }}>Inviter par email</Button>
          <Button onClick={() => { setShowForm(!showForm); setMode('creer'); }}><Plus size={16} /> Créer un compte</Button>
        </div>
      </div>

      {mode === 'inviter' && (
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px' }}>Inviter un médecin inscrit</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
            Le praticien doit déjà avoir un compte DjamSanté. Il recevra l&apos;invitation dans Carrière & affiliations.
          </p>
          <form onSubmit={handleInvite}>
            <Input label="Email du médecin *" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
            <textarea
              placeholder="Message d'invitation (optionnel)"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={2}
              style={{ width: '100%', marginTop: 12, padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }}
            />
            <Button type="submit" style={{ marginTop: 12 }} disabled={inviter.isPending}>Envoyer l&apos;invitation</Button>
          </form>
        </Card>
      )}

      {(affiliations || []).filter((a) => a.statut === 'en_attente').length > 0 && (
        <Card style={{ padding: 16, marginBottom: 16, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <strong>Invitations en attente :</strong>
          {(affiliations || []).filter((a) => a.statut === 'en_attente').map((a) => (
            <p key={a.id} style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
              Dr. {a.medecin?.prenom} {a.medecin?.nom} — {a.medecin?.email}
            </p>
          ))}
        </Card>
      )}

      {showForm && mode === 'creer' && (
        <Card style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Nouveau praticien</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Prénom *" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
              <Input label="Nom *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Spécialité *</label>
                <select
                  value={form.specialite}
                  onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4 }}
                >
                  <option value="">Choisir...</option>
                  {SPECIALITES_CM.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="N° Ordre des Médecins" value={form.numero_ordre} onChange={(e) => setForm({ ...form, numero_ordre: e.target.value })} />
              <Input label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+237 6XX XXX XXX" />
              <Input label="Email (connexion)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Mot de passe initial" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Input label="Tarif consultation (FCFA)" type="number" value={form.tarif_consultation_fcfa} onChange={(e) => setForm({ ...form, tarif_consultation_fcfa: e.target.value })} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Biographie</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4 }}
                placeholder="Parcours, formations, langues parlées..."
              />
            </div>
            <Button type="submit" style={{ marginTop: 16 }} disabled={addMedecin.isPending}>
              {addMedecin.isPending ? 'Inscription...' : 'Inscrire le médecin'}
            </Button>
          </form>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {(medecins || []).map((m) => {
          const photo = resolveFileUrl(m.photo_url, m.fichier_photo_id);
          return (
            <Card key={m.id} style={{ padding: 20, opacity: m.actif ? 1 : 0.6 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: photo ? `url(${photo}) center/cover` : 'linear-gradient(135deg,#10B981,#059669)',
                }} />
                <div style={{ flex: 1 }}>
                  <strong>Dr {m.prenom} {m.nom}</strong>
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#64748B' }}>{m.specialite}</p>
                  {m.numero_ordre && <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>Ordre : {m.numero_ordre}</p>}
                  {m.tarif_consultation_fcfa && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                      {Number(m.tarif_consultation_fcfa).toLocaleString()} FCFA
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleActif(m)}
                style={{ marginTop: 12, width: '100%' }}
              >
                {m.actif ? <><UserX size={14} /> Désactiver</> : <><UserCheck size={14} /> Réactiver</>}
              </Button>
            </Card>
          );
        })}
      </div>

      {(!medecins || medecins.length === 0) && !showForm && (
        <Card style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
          <Users size={40} style={{ marginBottom: 12 }} />
          <p>Aucun médecin inscrit. Commencez par ajouter votre équipe médicale.</p>
        </Card>
      )}
    </div>
  );
}
