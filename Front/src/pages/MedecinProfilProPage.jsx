import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Briefcase, Building2, Plus, X, Check, Trash2, Radio, Award, MapPin,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import PageHeader from '../components/ui/PageHeader';
import { useMedecinDashboard } from '../hooks/useDashboards';
import { useUpdateMedecinProfil } from '../hooks/useProfessionnel';
import {
  useMedecinAffiliations, useCreerCabinet, useRepondreAffiliation, useTerminerAffiliation,
  useMedecinParcours, useCreerParcours, useSupprimerParcours, useUpdateAffiliation,
} from '../hooks/useProfilPro';
import AffiliationHorairesEditor from '../components/medecin/AffiliationHorairesEditor';
import toast from 'react-hot-toast';

const Section = styled(Card)`
  padding: 22px;
  margin-bottom: 16px;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.82rem;
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  font-size: 0.9rem;

  input { width: 18px; height: 18px; }
`;

const AffCard = styled.div`
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 10px;
  background: ${({ theme }) => theme.colors.surface};
`;

const ROLE_LABELS = {
  titulaire: 'Titulaire', associe: 'Associé', remplacant: 'Remplaçant',
  consultant: 'Consultant', employe: 'Employé',
};
const TYPE_LIEU = { hopital: 'Hôpital', clinique: 'Clinique', cabinet_prive: 'Cabinet privé' };
const PARCOURS_TYPES = { experience: 'Expérience', formation: 'Formation', certification: 'Certification' };

export default function MedecinProfilProPage() {
  const { data, isLoading, refetch } = useMedecinDashboard();
  const updateProfil = useUpdateMedecinProfil();
  const { data: affiliations, refetch: refetchAff } = useMedecinAffiliations({ inclure_terminees: 'true' });
  const { data: parcours, refetch: refetchParcours } = useMedecinParcours();
  const creerCabinet = useCreerCabinet();
  const repondre = useRepondreAffiliation();
  const terminer = useTerminerAffiliation();
  const creerParcours = useCreerParcours();
  const supprimerParcours = useSupprimerParcours();
  const updateAffiliation = useUpdateAffiliation();

  const [competenceInput, setCompetenceInput] = useState('');
  const [competences, setCompetences] = useState([]);
  const [disponible, setDisponible] = useState(false);
  const [urgence, setUrgence] = useState(false);
  const [cabinetForm, setCabinetForm] = useState({ nom_lieu: '', adresse: '', ville: '' });
  const [parcoursForm, setParcoursForm] = useState({
    type: 'experience', titre: '', organisme: '', lieu: '', date_debut: '', date_fin: '', description: '', actuel: false,
  });
  const [showParcoursForm, setShowParcoursForm] = useState(false);

  React.useEffect(() => {
    if (data?.profil) {
      setCompetences(data.profil.competences || []);
      setDisponible(!!data.profil.disponible_maintenant);
      setUrgence(!!data.profil.joignable_urgence);
    }
  }, [data]);

  if (isLoading) return <Spinner />;
  const profil = data?.profil;

  const addCompetence = () => {
    const c = competenceInput.trim();
    if (!c || competences.includes(c)) return;
    setCompetences([...competences, c]);
    setCompetenceInput('');
  };

  const saveProfil = async () => {
    try {
      await updateProfil.mutateAsync({
        competences,
        disponible_maintenant: disponible,
        joignable_urgence: urgence,
      });
      await refetch();
      toast.success('Profil professionnel mis à jour');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleCabinet = async (e) => {
    e.preventDefault();
    try {
      await creerCabinet.mutateAsync({ ...cabinetForm, remplacer: true });
      toast.success('Cabinet privé enregistré');
      setCabinetForm({ nom_lieu: '', adresse: '', ville: '' });
      refetchAff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleParcours = async (e) => {
    e.preventDefault();
    if (!parcoursForm.titre.trim()) { toast.error('Titre requis'); return; }
    try {
      await creerParcours.mutateAsync(parcoursForm);
      toast.success('Ajouté au parcours');
      setParcoursForm({
        type: 'experience', titre: '', organisme: '', lieu: '', date_debut: '', date_fin: '', description: '', actuel: false,
      });
      setShowParcoursForm(false);
      refetchParcours();
    } catch {
      toast.error('Erreur');
    }
  };

  const pending = (affiliations || []).filter((a) => a.statut === 'en_attente');
  const actives = (affiliations || []).filter((a) => a.statut === 'actif');

  return (
    <div>
      <PageHeader
        title="Carrière & affiliations"
        subtitle="Gérez vos compétences, lieux d'exercice, disponibilité et parcours professionnel — visible dans l'annuaire national."
      />

      <Section>
        <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Radio size={18} /> Disponibilité
        </h3>
        <ToggleRow>
          <span><strong>Disponible maintenant</strong> — joignable pour une consultation rapide</span>
          <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} />
        </ToggleRow>
        <ToggleRow style={{ borderBottom: 'none' }}>
          <span><strong>Joignable en urgence</strong> — accepte les contacts prioritaires</span>
          <input type="checkbox" checked={urgence} onChange={(e) => setUrgence(e.target.checked)} />
        </ToggleRow>
      </Section>

      <Section>
        <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={18} /> Compétences
        </h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={competenceInput}
            onChange={(e) => setCompetenceInput(e.target.value)}
            placeholder="Ex. Échographie, Pédiatrie, Chirurgie..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetence())}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E7E5E4' }}
          />
          <Button type="button" size="sm" onClick={addCompetence}><Plus size={14} /></Button>
        </div>
        <TagRow>
          {competences.map((c) => (
            <Tag key={c}>
              {c}
              <button type="button" onClick={() => setCompetences(competences.filter((x) => x !== c))} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={14} />
              </button>
            </Tag>
          ))}
          {!competences.length && <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Aucune compétence — ajoutez-en pour être trouvé plus facilement.</span>}
        </TagRow>
        <Button onClick={saveProfil} disabled={updateProfil.isPending} style={{ marginTop: 12 }}>
          Enregistrer disponibilité & compétences
        </Button>
      </Section>

      <Section>
        <h3 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={18} /> Lieux d&apos;exercice
        </h3>

        {pending.map((a) => (
          <AffCard key={a.id}>
            <strong>Invitation — {a.etablissement?.nom || 'Établissement'}</strong>
            <p style={{ margin: '6px 0', fontSize: '0.85rem', color: '#64748B' }}>{a.message_invitation}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" onClick={async () => { await repondre.mutateAsync({ id: a.id, accepter: true }); toast.success('Invitation acceptée'); refetchAff(); }}>
                <Check size={14} /> Accepter
              </Button>
              <Button size="sm" variant="secondary" onClick={async () => { await repondre.mutateAsync({ id: a.id, accepter: false }); toast.success('Invitation refusée'); refetchAff(); }}>
                Refuser
              </Button>
            </div>
          </AffCard>
        ))}

        {actives.map((a) => (
          <AffCard key={a.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <strong>{a.type_lieu === 'cabinet_prive' ? a.nom_lieu : a.etablissement?.nom}</strong>
                <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#0F766E', fontWeight: 600 }}>
                  {TYPE_LIEU[a.type_lieu]} · {ROLE_LABELS[a.role]}
                </span>
                {(a.ville || a.etablissement?.ville) && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {a.adresse || a.etablissement?.adresse} — {a.ville || a.etablissement?.ville}
                  </p>
                )}
              </div>
              {a.statut === 'actif' && (
                <Button size="sm" variant="secondary" onClick={async () => { await terminer.mutateAsync(a.id); toast.success('Affiliation terminée'); refetchAff(); }}>
                  Terminer
                </Button>
              )}
            </div>
            {a.statut === 'actif' && (
              <AffiliationHorairesEditor
                horaires={a.horaires}
                isSaving={updateAffiliation.isPending}
                onSave={async (horaires) => {
                  await updateAffiliation.mutateAsync({ id: a.id, horaires });
                  toast.success('Horaires enregistrés pour ce lieu');
                  refetchAff();
                }}
              />
            )}
          </AffCard>
        ))}

        {!actives.length && !pending.length && (
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Aucune affiliation active. Une clinique peut vous inviter par email, ou créez votre cabinet ci-dessous.</p>
        )}

        <h4 style={{ margin: '20px 0 12px' }}>Mon cabinet privé</h4>
        <form onSubmit={handleCabinet}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Nom du cabinet *" value={cabinetForm.nom_lieu} onChange={(e) => setCabinetForm({ ...cabinetForm, nom_lieu: e.target.value })} required />
            <Input label="Ville *" value={cabinetForm.ville} onChange={(e) => setCabinetForm({ ...cabinetForm, ville: e.target.value })} required />
            <Input label="Adresse" value={cabinetForm.adresse} onChange={(e) => setCabinetForm({ ...cabinetForm, adresse: e.target.value })} style={{ gridColumn: '1 / -1' }} />
          </div>
          <Button type="submit" style={{ marginTop: 12 }} disabled={creerCabinet.isPending}>
            <Plus size={14} /> Enregistrer le cabinet
          </Button>
        </form>
      </Section>

      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={18} /> Parcours professionnel
          </h3>
          <Button size="sm" onClick={() => setShowParcoursForm(!showParcoursForm)}><Plus size={14} /> Ajouter</Button>
        </div>

        {showParcoursForm && (
          <form onSubmit={handleParcours} style={{ marginBottom: 16, padding: 14, background: '#FAFAF9', borderRadius: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.8rem' }}>Type</label>
                <select value={parcoursForm.type} onChange={(e) => setParcoursForm({ ...parcoursForm, type: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E7E5E4' }}>
                  <option value="experience">Expérience</option>
                  <option value="formation">Formation</option>
                  <option value="certification">Certification</option>
                </select>
              </div>
              <Input label="Titre *" value={parcoursForm.titre} onChange={(e) => setParcoursForm({ ...parcoursForm, titre: e.target.value })} required />
              <Input label="Organisme / employeur" value={parcoursForm.organisme} onChange={(e) => setParcoursForm({ ...parcoursForm, organisme: e.target.value })} />
              <Input label="Lieu" value={parcoursForm.lieu} onChange={(e) => setParcoursForm({ ...parcoursForm, lieu: e.target.value })} />
              <Input label="Date début" type="date" value={parcoursForm.date_debut} onChange={(e) => setParcoursForm({ ...parcoursForm, date_debut: e.target.value })} />
              <Input label="Date fin" type="date" value={parcoursForm.date_fin} onChange={(e) => setParcoursForm({ ...parcoursForm, date_fin: e.target.value })} />
            </div>
            <textarea
              placeholder="Description (optionnel)"
              value={parcoursForm.description}
              onChange={(e) => setParcoursForm({ ...parcoursForm, description: e.target.value })}
              rows={2}
              style={{ width: '100%', marginTop: 10, padding: 8, borderRadius: 8, border: '1px solid #E7E5E4' }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: '0.85rem' }}>
              <input type="checkbox" checked={parcoursForm.actuel} onChange={(e) => setParcoursForm({ ...parcoursForm, actuel: e.target.checked })} />
              Poste / formation actuel(le)
            </label>
            <Button type="submit" size="sm" style={{ marginTop: 10 }}>Enregistrer</Button>
          </form>
        )}

        {(parcours || []).length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Construisez votre CV en ligne — expériences, diplômes, certifications.</p>
        ) : (parcours || []).map((p) => (
          <AffCard key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>{PARCOURS_TYPES[p.type]}</span>
                <h4 style={{ margin: '4px 0' }}>{p.titre} {p.actuel && <span style={{ fontSize: '0.75rem', color: '#059669' }}>· Actuel</span>}</h4>
                {p.organisme && <p style={{ margin: 0, fontSize: '0.85rem' }}>{p.organisme}{p.lieu ? ` — ${p.lieu}` : ''}</p>}
                {(p.date_debut || p.date_fin) && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                    {p.date_debut || '?'} → {p.actuel ? 'Présent' : (p.date_fin || '?')}
                  </p>
                )}
                {p.description && <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#64748B' }}>{p.description}</p>}
              </div>
              <button type="button" onClick={async () => { await supprimerParcours.mutateAsync(p.id); toast.success('Supprimé'); refetchParcours(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </AffCard>
        ))}
      </Section>

      {profil?.numero_ordre && (
        <p style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
          N° ordre : {profil.numero_ordre} — Profil validé MINSANTE
        </p>
      )}
    </div>
  );
}
