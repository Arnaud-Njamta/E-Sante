import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Award, Languages } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useMedecin } from '../hooks/useMedecins';
import { useAvis, useCreerAvis } from '../hooks/useMessagerie';
import toast from 'react-hot-toast';

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  font-size: 0.9rem;
  &:hover { color: ${({ theme }) => theme.colors.primary[500]}; }
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  @media (max-width: 600px) { flex-direction: column; }
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const CompetenceTag = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.primary[50]};
  color: ${({ theme }) => theme.colors.primary[600]};
  font-size: 0.8rem;
  font-weight: 500;
  margin: 4px 4px 4px 0;
`;

const StarSelect = styled.div`
  display: flex;
  gap: 4px;
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: ${({ $active }) => ($active ? '#F59E0B' : '#D1D5DB')};
  }
`;

export default function MedecinDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: medecin, isLoading, error, refetch } = useMedecin(id);
  const { data: avisData } = useAvis('medecin', id);
  const creerAvis = useCreerAvis();
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Médecin introuvable" onRetry={refetch} />;

  const handleAvis = async () => {
    try {
      await creerAvis.mutateAsync({
        cible_type: 'medecin',
        cible_id: id,
        note,
        commentaire,
      });
      toast.success('Avis publié !');
      setCommentaire('');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la publication');
    }
  };

  return (
    <div>
      <BackBtn onClick={() => navigate('/sante')}><ArrowLeft size={18} /> Retour à l'annuaire</BackBtn>

      <ProfileHeader>
        <Avatar>{medecin.prenom?.[0]}{medecin.nom?.[0]}</Avatar>
        <div>
          <StarRating rating={medecin.note_moyenne} count={medecin.nombre_avis} size={18} />
          <h1 style={{ margin: '8px 0 4px', fontSize: '1.75rem' }}>Dr. {medecin.prenom} {medecin.nom}</h1>
          <p style={{ color: '#3B82F6', fontWeight: 600, margin: '0 0 8px' }}>{medecin.specialite}</p>
          {medecin.annees_experience && (
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              {medecin.annees_experience} ans d'expérience
              {medecin.numero_ordre && ` — N° ordre: ${medecin.numero_ordre}`}
            </p>
          )}
        </div>
      </ProfileHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 12px' }}>À propos</h3>
          <p style={{ color: '#64748B', lineHeight: 1.6 }}>{medecin.bio}</p>
          {medecin.telephone && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: '0.9rem' }}>
              <Phone size={16} /> {medecin.telephone}
            </p>
          )}
          {medecin.etablissement && (
            <p
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: '0.9rem', cursor: 'pointer', color: '#3B82F6' }}
              onClick={() => navigate(`/sante/etablissement/${medecin.etablissement.id}`)}
            >
              <MapPin size={16} /> {medecin.etablissement.nom} — {medecin.etablissement.ville}
            </p>
          )}
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 12px' }}><Award size={18} style={{ verticalAlign: 'middle' }} /> Compétences</h3>
          <div>
            {(medecin.competences || []).map((c) => (
              <CompetenceTag key={c}>{c}</CompetenceTag>
            ))}
          </div>
          {medecin.langues?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>
                <Languages size={16} style={{ verticalAlign: 'middle' }} /> Langues parlées
              </h4>
              <p style={{ margin: 0, color: '#64748B' }}>{medecin.langues.join(', ')}</p>
            </div>
          )}
        </Card>
      </div>

      <Card style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>Avis patients</h3>
        {avisData?.avis?.length > 0 ? avisData.avis.map((a) => (
          <div key={a.id} style={{ borderBottom: '1px solid #E2E8F0', padding: '12px 0' }}>
            <StarRating rating={a.note} showCount={false} size={14} />
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              <strong>{a.patient?.prenom} {a.patient?.nom?.[0]}.</strong> — {a.commentaire}
            </p>
          </div>
        )) : <p style={{ color: '#94A3B8' }}>Aucun avis pour le moment.</p>}

        <div style={{ marginTop: 16 }}>
          <p style={{ fontWeight: 600 }}>Laisser un avis</p>
          <StarSelect>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" $active={s <= note} onClick={() => setNote(s)}>★</button>
            ))}
          </StarSelect>
          <textarea
            placeholder="Partagez votre expérience avec ce médecin..."
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #E2E8F0', borderRadius: 8, margin: '8px 0', minHeight: 80 }}
          />
          <Button onClick={handleAvis} disabled={creerAvis.isPending}>Publier mon avis</Button>
        </div>
      </Card>
    </div>
  );
}
