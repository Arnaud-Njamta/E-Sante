import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Clock, MessageCircle, ShoppingBag, Pill, Shield, CreditCard, Video, Newspaper, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import CommissionSummary from '../components/ui/CommissionSummary';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { useEtablissement, useEtablissementHoraires, useEtablissementPublications } from '../hooks/useEtablissements';
import { useAvis, useCreerAvis } from '../hooks/useMessagerie';
import { useDemarrerConversation } from '../hooks/useMessagerie';
import { useCreerReservation, useOrdonnancesElecPatient } from '../hooks/useReservations';
import { useCreerDemandePriseEnCharge } from '../hooks/useUrgence';
import { useOrdonnancesPharmacie } from '../hooks/useOrdonnances';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { resolveFileUrl } from '../components/ui/PhotoUploadCard';

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
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 8px;

  span {
    display: inline-block;
    line-height: 1.35;
    word-break: break-word;
  }
`;

const ProduitBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  width: fit-content;
  max-width: 100%;
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
`;

const StarBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.75rem;
  line-height: 1;
  padding: 2px;
  color: ${({ $filled }) => ($filled ? '#F59E0B' : '#D1D5DB')};
`;

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const TYPE_LABELS = {
  pharmacie: 'Pharmacie',
  hopital: 'Hôpital',
  clinique: 'Clinique',
};

const ProduitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const ProduitCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[4]};
  overflow: hidden;
  min-width: 0;
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 8px;
  }
`;

const Hero = styled.div`
  height: 200px;
  border-radius: 16px;
  background: ${({ $url }) => ($url ? `url(${$url}) center/cover` : 'linear-gradient(135deg, #0D9488, #134E4A)')};
  margin-bottom: 20px;
  position: relative;
`;

const MinsanteBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #ECFDF5;
  color: #047857;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const MapEmbed = styled.iframe`
  width: 100%;
  height: 220px;
  border: none;
  border-radius: 12px;
  margin-top: 12px;
`;

export default function EtablissementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const ajouterProduitId = searchParams.get('ajouter');
  const { data: etab, isLoading, error, refetch } = useEtablissement(id);
  const { data: horairesInfo } = useEtablissementHoraires(id);
  const { data: publications } = useEtablissementPublications(id);
  const { data: avisData } = useAvis('etablissement', id);
  const creerAvis = useCreerAvis();
  const demarrerConv = useDemarrerConversation();
  const creerReservation = useCreerReservation();
  const creerDemande = useCreerDemandePriseEnCharge();
  const { data: ordonnancesElec } = useOrdonnancesElecPatient();
  const { data: ordonnancesPapier } = useOrdonnancesPharmacie();
  const { isPatient } = useAuth();

  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [panier, setPanier] = useState([]);
  const [commissionPanier, setCommissionPanier] = useState(null);
  const [msgReservation, setMsgReservation] = useState('');
  const [ordonnanceElecId, setOrdonnanceElecId] = useState('');
  const [ordonnancePapierId, setOrdonnancePapierId] = useState('');
  const panierRef = useRef(null);
  const ajouteDepuisUrl = useRef(null);

  useEffect(() => {
    if (!ajouterProduitId || !etab?.produits?.length || !isPatient) return;
    if (ajouteDepuisUrl.current === ajouterProduitId) return;
    const p = etab.produits.find((x) => String(x.id) === String(ajouterProduitId));
    if (!p || p.stock_disponible <= 0) return;
    ajouteDepuisUrl.current = ajouterProduitId;
    setPanier((prev) => {
      if (prev.some((x) => String(x.produit_id) === String(p.id))) return prev;
      return [...prev, {
        produit_id: p.id,
        nom: p.nom,
        quantite: 1,
        prix_fcfa_unitaire: p.prix_fcfa,
        necessite_ordonnance: !!p.necessite_ordonnance,
      }];
    });
    toast.success(`${p.nom} ajouté à votre réservation`);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('ajouter');
      return next;
    }, { replace: true });
    setTimeout(() => panierRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }, [ajouterProduitId, etab?.produits, isPatient, setSearchParams]);

  useEffect(() => {
    if (!panier.length) {
      setCommissionPanier(null);
      return undefined;
    }
    let cancelled = false;
    client.post(ENDPOINTS.reservations.estimer, { lignes: panier })
      .then(({ data }) => { if (!cancelled) setCommissionPanier(data.data); })
      .catch(() => { if (!cancelled) setCommissionPanier(null); });
    return () => { cancelled = true; };
  }, [panier]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Établissement introuvable" onRetry={refetch} />;

  const horaires = horairesInfo?.horaires_ouverture || etab.horaires_ouverture || {};
  const produits = (etab.produits || []).filter((p) => p.actif !== false && p.stock_disponible > 0);
  const panierNeedsOrdonnance = panier.some((l) => l.necessite_ordonnance);
  const heroUrl = resolveFileUrl(etab.image_url, etab.fichier_photo_id);
  const modesPaiement = (() => {
    if (Array.isArray(etab.modes_paiement)) return etab.modes_paiement;
    try { return JSON.parse(etab.modes_paiement || '[]'); } catch { return []; }
  })();
  const mapUrl = etab.latitude && etab.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${etab.longitude - 0.01}%2C${etab.latitude - 0.01}%2C${etab.longitude + 0.01}%2C${etab.latitude + 0.01}&layer=mapnik&marker=${etab.latitude}%2C${etab.longitude}`
    : null;

  const handleChat = async () => {
    try {
      const conv = await demarrerConv.mutateAsync({
        etablissementId: id,
        message_initial: 'Bonjour, j\'aimerais savoir si un médicament est disponible.',
      });
      navigate(`/pharmacie/chat/${conv.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Messagerie non disponible pour cet établissement');
    }
  };

  const ajouterPanier = (p) => {
    setPanier((prev) => {
      const exist = prev.find((x) => x.produit_id === p.id);
      if (exist) return prev.map((x) => x.produit_id === p.id ? { ...x, quantite: x.quantite + 1 } : x);
      return [...prev, {
        produit_id: p.id,
        nom: p.nom,
        quantite: 1,
        prix_fcfa_unitaire: p.prix_fcfa,
        necessite_ordonnance: !!p.necessite_ordonnance,
      }];
    });
    toast.success(`${p.nom} ajouté`);
  };

  const handleReserver = async () => {
    if (!panier.length) return;
    if (panierNeedsOrdonnance && !ordonnanceElecId && !ordonnancePapierId) {
      toast.error('Sélectionnez ou scannez une ordonnance pour les médicaments sur prescription');
      return;
    }
    try {
      const result = await creerReservation.mutateAsync({
        etablissement_id: id,
        lignes: panier,
        message_patient: msgReservation || undefined,
        ordonnance_electronique_id: ordonnanceElecId || undefined,
        ordonnance_papier_id: ordonnancePapierId || undefined,
      });
      const noms = panier.map((l) => l.nom).join(', ');
      toast.success(`Réservation envoyée : ${noms}`);
      setPanier([]);
      setMsgReservation('');
      setOrdonnanceElecId('');
      setOrdonnancePapierId('');
      navigate('/reservations', { state: { highlightId: result?.id } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur réservation');
    }
  };

  const handleDemandeService = async (service) => {
    const msg = window.prompt(`Message pour ${etab.nom} (optionnel) :`, `Demande pour : ${service.nom}`);
    if (msg === null) return;
    try {
      await creerDemande.mutateAsync({
        etablissement_id: id,
        service_id: service.id,
        message_patient: msg || `Demande pour ${service.nom}`,
      });
      toast.success('Demande envoyée — l\'établissement vous répondra sous peu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
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

      {heroUrl && <Hero $url={heroUrl} />}

      <Header>
        {etab.statut_validation === 'valide' && etab.numero_agrement && (
          <MinsanteBadge><Shield size={14} /> Agrément MINSANTE : {etab.numero_agrement}</MinsanteBadge>
        )}
        <StarRating rating={etab.note_moyenne} count={etab.nombre_avis} size={20} />
        <h1>{etab.nom}</h1>
        <p style={{ color: '#64748B' }}>{TYPE_LABELS[etab.type]} — {etab.region || etab.ville}</p>
        <p style={{ color: '#64748B' }}>{etab.description}</p>
      </Header>

      <InfoGrid>
        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Informations</h3>
          {etab.adresse && <InfoRow><MapPin /> {etab.adresse}, {etab.ville}</InfoRow>}
          {etab.telephone && <InfoRow><Phone /> {etab.telephone}</InfoRow>}
          {etab.email && <InfoRow><Mail /> {etab.email}</InfoRow>}
          {modesPaiement.length > 0 && (
            <InfoRow><CreditCard /> {modesPaiement.join(' · ')}</InfoRow>
          )}
          {mapUrl && <MapEmbed title="Localisation" src={mapUrl} loading="lazy" />}
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

      {produits.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3><Pill size={18} style={{ verticalAlign: 'middle' }} /> Médicaments disponibles</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Stock en temps réel — {TYPE_LABELS[etab.type] || 'Établissement'} {etab.nom}
            {etab.type !== 'pharmacie' && ' (dispensaire interne)'}
          </p>
          <ProduitGrid>
            {produits.map((p) => {
              const imgSrc = resolveFileUrl(p.image_url, p.fichier_image_id);
              return (
              <ProduitCard key={p.id}>
                {imgSrc && <img src={imgSrc} alt={p.nom} />}
                <ServiceName>{p.nom}</ServiceName>
                {p.description && <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>{p.description}</p>}
                <strong style={{ color: '#059669', fontSize: '0.95rem' }}>{Number(p.prix_fcfa || 0).toLocaleString()} FCFA</strong>
                <ServiceMeta>
                  {p.categorie && <ProduitBadge style={{ background: '#F1F5F9', color: '#475569' }}>{p.categorie}</ProduitBadge>}
                  <ProduitBadge style={{ background: '#DCFCE7', color: '#166534' }}>En stock ({p.stock_disponible})</ProduitBadge>
                  {p.necessite_ordonnance && (
                    <ProduitBadge style={{ background: '#FEF3C7', color: '#92400E' }}>Ordonnance requise</ProduitBadge>
                  )}
                </ServiceMeta>
                {isPatient && (
                  <Button size="sm" variant="secondary" onClick={() => ajouterPanier(p)} style={{ marginTop: 10, width: '100%' }}>
                    Ajouter à ma réservation
                  </Button>
                )}
              </ProduitCard>
              );
            })}
          </ProduitGrid>
          {isPatient && panier.length > 0 && (
            <div ref={panierRef}>
            <Card style={{ padding: 20, marginTop: 16, background: '#F8FAFC' }}>
              <h4 style={{ margin: '0 0 12px' }}>Panier ({panier.length} article{panier.length > 1 ? 's' : ''})</h4>
              <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: '0.9rem' }}>
                {panier.map((l) => (
                  <li key={l.produit_id}>{l.nom} × {l.quantite} — {(l.prix_fcfa_unitaire * l.quantite).toLocaleString()} FCFA</li>
                ))}
              </ul>
              <textarea
                placeholder="Message optionnel (date de retrait souhaitée...)"
                value={msgReservation}
                onChange={(e) => setMsgReservation(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }}
              />
              {panierNeedsOrdonnance && (
                <div style={{ marginBottom: 12, padding: 12, background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, color: '#92400E' }}>
                    Ordonnance requise pour certains médicaments
                  </p>
                  {(ordonnancesElec || []).length > 0 && (
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 6 }}>
                      Ordonnance électronique
                      <select
                        value={ordonnanceElecId}
                        onChange={(e) => { setOrdonnanceElecId(e.target.value); setOrdonnancePapierId(''); }}
                        style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 8, border: '1px solid #E2E8F0' }}
                      >
                        <option value="">— Choisir —</option>
                        {(ordonnancesElec || []).map((o) => (
                          <option key={o.id} value={o.id}>{o.numero_unique} — Dr {o.medecin?.nom}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {(ordonnancesPapier || []).length > 0 && (
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 6 }}>
                      Ordonnance scannée / photographiée
                      <select
                        value={ordonnancePapierId}
                        onChange={(e) => { setOrdonnancePapierId(e.target.value); setOrdonnanceElecId(''); }}
                        style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 8, border: '1px solid #E2E8F0' }}
                      >
                        <option value="">— Choisir —</option>
                        {(ordonnancesPapier || []).map((o) => (
                          <option key={o.id} value={o.id}>{o.nom_fichier || `Scan ${new Date(o.date_scan).toLocaleDateString('fr-FR')}`}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                    Pas d&apos;ordonnance ? <Link to="/ordonnances">Filmer ou scanner votre ordonnance</Link>
                  </p>
                </div>
              )}
              <CommissionSummary breakdown={commissionPanier} label="Récapitulatif réservation" />
              <Button onClick={handleReserver} disabled={creerReservation.isPending}>
                Envoyer la demande de réservation
              </Button>
            </Card>
            </div>
          )}
          {etab.chat_actif && isPatient && (
            <Button onClick={handleChat} variant="secondary" style={{ marginTop: 16 }} disabled={demarrerConv.isPending}>
              <MessageCircle size={16} /> Contacter via messagerie
            </Button>
          )}
        </div>
      )}

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
                {isPatient && (etab.type === 'hopital' || etab.type === 'clinique') && (
                  <Button size="sm" style={{ marginTop: 10 }} onClick={() => handleDemandeService(s)} disabled={creerDemande.isPending}>
                    Demander une prise en charge
                  </Button>
                )}
              </ServiceCard>
            ))}
          </div>
        </div>
      )}

      {etab.equipe?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3><Users size={18} style={{ verticalAlign: 'middle' }} /> Notre équipe</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
            {etab.equipe.map((m) => (
              <ServiceCard key={m.id}>
                <ServiceName>{m.prenom} {m.nom}</ServiceName>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#0F766E', fontWeight: 600 }}>{m.role}</p>
                {m.bio && <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#64748B' }}>{m.bio}</p>}
                {m.competences?.length > 0 && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>{m.competences.join(' · ')}</p>
                )}
              </ServiceCard>
            ))}
          </div>
        </div>
      )}

      {etab.medecins?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>Prendre rendez-vous — Médecins de l'établissement</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginTop: 16 }}>
            {etab.medecins.map((m) => (
              <ServiceCard key={m.id} onClick={() => navigate(`/sante/medecin/${m.id}`)} style={{ cursor: 'pointer' }}>
                <ServiceName>Dr. {m.prenom} {m.nom}</ServiceName>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{m.specialite}</p>
                {m.accepte_teleconsultation && (
                  <span style={{ fontSize: '0.7rem', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Video size={12} /> Téléconsultation disponible
                  </span>
                )}
                <StarRating rating={m.note_moyenne} count={m.nombre_avis} size={14} />
              </ServiceCard>
            ))}
          </div>
        </div>
      )}

      {publications?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3><Newspaper size={18} style={{ verticalAlign: 'middle' }} /> Actualités & réalisations</h3>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {publications.map((p) => (
              <ServiceCard key={p.id}>
                <span style={{ fontSize: '0.7rem', color: '#0D9488', fontWeight: 600 }}>
                  {p.type === 'realisation' ? 'Réalisation' : 'Actualité'}
                </span>
                <ServiceName>{p.titre}</ServiceName>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{p.contenu}</p>
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
              <StarBtn key={s} type="button" $filled={s <= note} onClick={() => setNote(s)}>★</StarBtn>
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
