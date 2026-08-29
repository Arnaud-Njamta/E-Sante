import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Clock, MessageCircle, ShoppingBag } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useEtablissement, useEtablissementHoraires } from '../hooks/useEtablissements';
import { useAvis, useCreerAvis } from '../hooks/useMessagerie';
import { useDemarrerConversation } from '../hooks/useMessagerie';
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

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  h1 { font-size: 1.75rem; font-weight: 700; margin: 8px 0; }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
  svg { width: 16px; flex-shrink: 0; }
`;

const ServiceCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ServiceName = styled.h4`
  margin: 0 0 4px;
  font-size: 0.95rem;
`;

const ServiceMeta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 6px;
`;

const HoraireGrid = styled.div`
  display: grid;
  gap: 4px;
  font-size: 0.85rem;
`;

const HoraireRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  span:last-child { color: ${({ theme, $ouvert }) => ($ouvert ? theme.colors.success[500] : theme.colors.danger[500])}; }
`;

const AvisForm = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: 0.9rem;
    margin: 8px 0;
    resize: vertical;
    min-height: 80px;
  }
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

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function EtablissementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: etab, isLoading, error, refetch } = useEtablissement(id);
  const { data: horairesInfo } = useEtablissementHoraires(id);
  const { data: avisData } = useAvis('etablissement', id);
  const creerAvis = useCreerAvis();
  const demarrerConv = useDemarrerConversation();

  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Établissement introuvable" onRetry={refetch} />;

  const horaires = horairesInfo?.horaires_ouverture || etab.horaires_ouverture || {};

  const handleChat = async () => {
    try {
      const conv = await demarrerConv.mutateAsync({
        pharmacieId: id,
        message_initial: 'Bonjour, j\'aimerais savoir si un produit est disponible.',
      });
      navigate(`/pharmacie/chat/${conv.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chat non disponible pour cet établissement');
    }
  };

  const handleAvis = async () => {
    try {
      await creerAvis.mutateAsync({
        cible_type: 'etablissement',
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

      <Header>
        <StarRating rating={etab.note_moyenne} count={etab.nombre_avis} size={20} />
        <h1>{etab.nom}</h1>
        <p style={{ color: '#64748B' }}>{etab.description}</p>
      </Header>

      <InfoGrid>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Informations</h3>
          {etab.adresse && <InfoRow><MapPin /> {etab.adresse}, {etab.ville}</InfoRow>}
          {etab.telephone && <InfoRow><Phone /> {etab.telephone}</InfoRow>}
          {etab.email && <InfoRow><Mail /> {etab.email}</InfoRow>}
          {horairesInfo && (
            <InfoRow>
              <Clock />
              {horairesInfo.est_ouvert_maintenant
                ? <span style={{ color: '#22C55E', fontWeight: 600 }}>Ouvert maintenant</span>
                : <span style={{ color: '#EF4444' }}>Fermé actuellement</span>}
            </InfoRow>
          )}
          {etab.type === 'pharmacie' && etab.chat_actif && (
            <Button onClick={handleChat} style={{ marginTop: 16 }} disabled={demarrerConv.isPending}>
              <MessageCircle size={16} /> Contacter la pharmacie (H24)
            </Button>
          )}
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}><Clock size={18} style={{ verticalAlign: 'middle' }} /> Horaires</h3>
          {horaires.h24 ? (
            <p style={{ color: '#22C55E', fontWeight: 600 }}>Ouvert 24h/24</p>
          ) : (
            <HoraireGrid>
              {JOURS.map((jour) => {
                const h = horaires[jour];
                return (
                  <HoraireRow key={jour} $ouvert={h?.ouvert}>
                    <span style={{ textTransform: 'capitalize' }}>{jour}</span>
                    <span>{h?.ouvert ? `${h.debut} - ${h.fin}` : 'Fermé'}</span>
                  </HoraireRow>
                );
              })}
            </HoraireGrid>
          )}
        </Card>
      </InfoGrid>

      {etab.services?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3><ShoppingBag size={18} style={{ verticalAlign: 'middle' }} /> Services proposés</h3>
          <div style={{ marginTop: 16 }}>
            {etab.services.map((s) => (
              <ServiceCard key={s.id}>
                <ServiceName>{s.nom}</ServiceName>
                {s.description && <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{s.description}</p>}
                <ServiceMeta>
                  {s.categorie && <span>{s.categorie}</span>}
                  {s.prix_indicatif && <span>{Number(s.prix_indicatif).toLocaleString()} FCFA</span>}
                  {s.duree_minutes && <span>{s.duree_minutes} min</span>}
                </ServiceMeta>
              </ServiceCard>
            ))}
          </div>
        </div>
      )}

      {etab.medecins?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Médecins de l'établissement</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginTop: 16 }}>
            {etab.medecins.map((m) => (
              <ServiceCard key={m.id} onClick={() => navigate(`/sante/medecin/${m.id}`)} style={{ cursor: 'pointer' }}>
                <ServiceName>Dr. {m.prenom} {m.nom}</ServiceName>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{m.specialite}</p>
                <StarRating rating={m.note_moyenne} count={m.nombre_avis} size={14} />
              </ServiceCard>
            ))}
          </div>
        </div>
      )}

      <Card style={{ padding: 24, marginTop: 32 }}>
        <h3 style={{ margin: '0 0 16px' }}>Avis patients</h3>
        {avisData?.avis?.length > 0 ? avisData.avis.map((a) => (
          <div key={a.id} style={{ borderBottom: '1px solid #E2E8F0', padding: '12px 0' }}>
            <StarRating rating={a.note} showCount={false} size={14} />
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              <strong>{a.patient?.prenom} {a.patient?.nom?.[0]}.</strong> — {a.commentaire}
            </p>
          </div>
        )) : <p style={{ color: '#94A3B8' }}>Aucun avis pour le moment. Soyez le premier !</p>}

        <AvisForm>
          <p style={{ fontWeight: 600, margin: '16px 0 4px' }}>Laisser un avis</p>
          <StarSelect>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" $active={s <= note} onClick={() => setNote(s)}>★</button>
            ))}
          </StarSelect>
          <textarea
            placeholder="Partagez votre expérience..."
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
          <Button onClick={handleAvis} disabled={creerAvis.isPending}>Publier mon avis</Button>
        </AvisForm>
      </Card>
    </div>
  );
}
