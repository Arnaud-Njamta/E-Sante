import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Phone, Award, Languages, Video, Shield, Building2, Briefcase, Radio } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import CommissionSummary from '../components/ui/CommissionSummary';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { useMedecin } from '../hooks/useMedecins';
import { useAvis, useCreerAvis } from '../hooks/useMessagerie';
import { useCreneaux, useCreerRdv } from '../hooks/useRendezVous';
import { useTextesConsentement } from '../hooks/useCarnetMedical';
import OrdonnanceScanPicker from '../components/rdv/OrdonnanceScanPicker';
import { parseJsonArray } from '../utils/helpers';
import { resolveFileUrl } from '../components/ui/PhotoUploadCard';
import { useAuth } from '../context/AuthContext';
import { formatHorairesSummary } from '../utils/horairesDefaults';
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
  background: ${({ $url }) => ($url ? `url(${$url}) center/cover` : 'linear-gradient(135deg, #3B82F6, #1D4ED8)')};
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
`;

const StarBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.75rem;
  line-height: 1;
  padding: 2px;
  color: ${({ $filled }) => ($filled ? '#F59E0B' : '#D1D5DB')};
  transition: transform 0.1s ease, color 0.15s ease;

  &:hover { transform: scale(1.1); }
`;

const SlotGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const SlotBtn = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid ${({ $active }) => ($active ? '#059669' : '#E2E8F0')};
  background: ${({ $active }) => ($active ? '#ECFDF5' : '#fff')};
  color: ${({ $active }) => ($active ? '#047857' : '#334155')};
  font-size: 0.85rem;
  cursor: pointer;
  &:hover { border-color: #059669; }
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const RdvFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
  }

  input, select, textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #E2E8F0;
    font-size: 0.95rem;
    box-sizing: border-box;
    background: #fff;
  }
`;

const RdvCard = styled(Card)`
  padding: 24px;
  margin-top: 24px;

  @media (max-width: 600px) {
    padding: 18px 16px;
  }
`;

export default function MedecinDetailPage({ overrideId, isOwnProfile = false }) {
  const { id: paramId } = useParams();
  const id = overrideId || paramId;
  const navigate = useNavigate();
  const { data: medecin, isLoading, error, refetch } = useMedecin(id);
  const { data: avisData, refetch: refetchAvis } = useAvis('medecin', id);
  const creerAvis = useCreerAvis();
  const { isPatient, isMedecin, user } = useAuth();
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [dateRdv, setDateRdv] = useState('');
  const [heureRdv, setHeureRdv] = useState('');
  const [motif, setMotif] = useState('');
  const [typeConsultation, setTypeConsultation] = useState('presentiel');
  const [selectedAffiliation, setSelectedAffiliation] = useState('');
  const [consentPolitique, setConsentPolitique] = useState(false);
  const [consentTele, setConsentTele] = useState(false);
  const [ordonnanceScan, setOrdonnanceScan] = useState(null);
  const { data: textesConsent } = useTextesConsentement();
  const { data: creneauxData, isLoading: creneauxLoading, isError: creneauxError } = useCreneaux(
    id, dateRdv, selectedAffiliation || null,
  );
  const creerRdv = useCreerRdv();

  useEffect(() => {
    setHeureRdv('');
  }, [dateRdv]);

  const creneaux = creneauxData?.creneaux || [];
  const { data: commissionPreview } = useQuery({
    queryKey: ['commission-preview', id],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.commissions.previewConsultation, {
        params: { medecin_id: id },
      });
      return data.data;
    },
    enabled: !!id,
  });

  const isPreview = isOwnProfile || (isMedecin && user?.id === id);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState message="Médecin introuvable" onRetry={refetch} />;

  const competences = parseJsonArray(medecin?.competences);
  const langues = parseJsonArray(medecin?.langues, ['Français']);
  const photoUrl = resolveFileUrl(medecin?.photo_url, medecin?.fichier_photo_id);

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
      refetchAvis();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la publication');
    }
  };

  const handleRdv = async () => {
    if (!dateRdv || !heureRdv) { toast.error('Choisissez une date et un créneau'); return; }
    if (!consentPolitique) {
      toast.error('Vous devez accepter la politique de confidentialité');
      return;
    }
    if (typeConsultation === 'teleconsultation' && !consentTele) {
      toast.error('Consentement téléconsultation requis');
      return;
    }
    try {
      await creerRdv.mutateAsync({
        medecin_id: id,
        date_rdv: dateRdv,
        heure_debut: heureRdv,
        motif,
        type_consultation: typeConsultation,
        consentement_politique: true,
        consentement_teleconsultation: typeConsultation === 'teleconsultation',
        politique_version: textesConsent?.version,
        ordonnance_scan_id: ordonnanceScan?.id,
      });
      toast.success('Demande de rendez-vous envoyée !');
      navigate('/rendez-vous');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Créneau indisponible');
    }
  };

  return (
    <div>
      {isPreview && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 10,
          background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '0.9rem',
        }}>
          Aperçu patient — voici comment les patients voient votre profil public dans l&apos;annuaire.
        </div>
      )}

      {!isPreview && (
        <BackBtn onClick={() => navigate('/sante')}><ArrowLeft size={18} /> Retour à l&apos;annuaire</BackBtn>
      )}
      {isPreview && (
        <BackBtn onClick={() => navigate('/medecin/dashboard')}><ArrowLeft size={18} /> Retour au tableau de bord</BackBtn>
      )}

      <ProfileHeader>
        <Avatar $url={photoUrl}>
          {!photoUrl && <>{medecin.prenom?.[0]}{medecin.nom?.[0]}</>}
        </Avatar>
        <div>
          <StarRating rating={medecin.note_moyenne} count={medecin.nombre_avis} size={18} />
          <h1 style={{ margin: '8px 0 4px', fontSize: '1.75rem' }}>Dr. {medecin.prenom} {medecin.nom}</h1>
          <p style={{ color: '#3B82F6', fontWeight: 600, margin: '0 0 8px' }}>{medecin.specialite}</p>
          {(medecin.disponible_maintenant || medecin.joignable_urgence) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {medecin.disponible_maintenant && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>
                  <Radio size={12} /> Disponible maintenant
                </span>
              )}
              {medecin.joignable_urgence && (
                <span style={{ padding: '4px 10px', borderRadius: 20, background: '#FEE2E2', color: '#991B1B', fontSize: '0.75rem', fontWeight: 600 }}>
                  Joignable en urgence
                </span>
              )}
            </div>
          )}
          {medecin.statut_validation === 'valide' && medecin.numero_ordre && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#047857', margin: '0 0 8px' }}>
              <Shield size={14} /> Validé MINSANTE — N° ordre {medecin.numero_ordre}
            </p>
          )}
          {medecin.annees_experience && (
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              {medecin.annees_experience} ans d'expérience
              {medecin.numero_ordre && ` — N° ordre: ${medecin.numero_ordre}`}
            </p>
          )}
        </div>
      </ProfileHeader>

      <TwoColGrid>
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
          {medecin.affiliations?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={16} /> Lieux d&apos;exercice
              </h4>
              {medecin.affiliations.map((a) => (
                <p key={a.id} style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748B' }}>
                  {a.type_lieu === 'cabinet_prive' ? a.nom_lieu : a.etablissement?.nom}
                  {' — '}{a.ville || a.etablissement?.ville}
                  {a.type_lieu === 'cabinet_prive' && ' (Cabinet privé)'}
                  {a.horaires && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>
                      {formatHorairesSummary(a.horaires)}
                    </span>
                  )}
                </p>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 12px' }}><Award size={18} style={{ verticalAlign: 'middle' }} /> Compétences</h3>
          <div>
            {(competences).map((c) => (
              <CompetenceTag key={c}>{c}</CompetenceTag>
            ))}
          </div>
          {langues.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>
                <Languages size={16} style={{ verticalAlign: 'middle' }} /> Langues parlées
              </h4>
              <p style={{ margin: 0, color: '#64748B' }}>{langues.join(', ')}</p>
            </div>
          )}
        </Card>
      </TwoColGrid>

      {medecin.parcours?.length > 0 && (
        <Card style={{ padding: 24, marginTop: 24 }}>
          <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={18} /> Parcours professionnel
          </h3>
          {medecin.parcours.map((p) => (
            <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
              <strong>{p.titre}</strong>
              {p.actuel && <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#059669' }}>Actuel</span>}
              {p.organisme && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>{p.organisme}{p.lieu ? ` — ${p.lieu}` : ''}</p>}
              {(p.date_debut || p.date_fin) && (
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                  {p.date_debut || '?'} → {p.actuel ? 'Présent' : (p.date_fin || '?')}
                </p>
              )}
            </div>
          ))}
        </Card>
      )}

      {!isPreview && isPatient && (
        <RdvCard>
          <h3 style={{ margin: '0 0 16px' }}>Prendre rendez-vous</h3>
          {medecin.affiliations?.length > 0 && (
            <FieldGroup style={{ marginBottom: 16 }}>
              <label>Lieu de consultation</label>
              <select
                value={selectedAffiliation}
                onChange={(e) => { setSelectedAffiliation(e.target.value); setHeureRdv(''); }}
              >
                <option value="">Horaires généraux</option>
                {medecin.affiliations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.type_lieu === 'cabinet_prive' ? a.nom_lieu : a.etablissement?.nom}
                    {a.ville ? ` (${a.ville})` : ''}
                  </option>
                ))}
              </select>
            </FieldGroup>
          )}
          <RdvFormGrid>
            <FieldGroup>
              <label>Date</label>
              <input
                type="date"
                value={dateRdv}
                onChange={(e) => setDateRdv(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </FieldGroup>
            <FieldGroup>
              <label>Motif</label>
              <input
                type="text"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Consultation, renouvellement..."
              />
            </FieldGroup>
          </RdvFormGrid>
          <FieldGroup style={{ marginTop: 16 }}>
            <label>Créneau disponible</label>
            {!dateRdv && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>Sélectionnez une date pour voir les créneaux.</p>
            )}
            {dateRdv && creneauxLoading && <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>Chargement des créneaux...</p>}
            {dateRdv && creneauxError && <p style={{ margin: 0, fontSize: '0.85rem', color: '#DC2626' }}>Impossible de charger les créneaux.</p>}
            {dateRdv && !creneauxLoading && !creneauxError && creneaux.length === 0 && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#B45309' }}>
                Aucun créneau ce jour-là. Essayez une autre date (lun–ven, 8h–18h).
              </p>
            )}
            {dateRdv && creneaux.length > 0 && (
              <SlotGrid>
                {creneaux.map((c) => (
                  <SlotBtn
                    key={c.debut}
                    type="button"
                    $active={heureRdv === c.debut}
                    onClick={() => setHeureRdv(c.debut)}
                  >
                    {c.debut} — {c.fin}
                  </SlotBtn>
                ))}
              </SlotGrid>
            )}
          </FieldGroup>
          <OrdonnanceScanPicker
            value={ordonnanceScan}
            onChange={setOrdonnanceScan}
            disabled={creerRdv.isPending}
          />
          {medecin.accepte_teleconsultation && (
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" name="type" checked={typeConsultation === 'presentiel'} onChange={() => setTypeConsultation('presentiel')} />
                Présentiel
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" name="type" checked={typeConsultation === 'teleconsultation'} onChange={() => setTypeConsultation('teleconsultation')} />
                <Video size={14} /> Téléconsultation
              </label>
            </div>
          )}
          {medecin.tarif_consultation_fcfa != null && (
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 12 }}>
              Tarif consultation : {Number(medecin.tarif_consultation_fcfa).toLocaleString()} FCFA
            </p>
          )}
          <CommissionSummary
            breakdown={creneauxData?.commission || commissionPreview}
            label="Tarif & frais plateforme"
          />
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 10,
            background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.82rem',
          }}>
            <p style={{ margin: '0 0 10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} /> Consentements (RGPD)
            </p>
            <label style={{ display: 'flex', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={consentPolitique} onChange={(e) => setConsentPolitique(e.target.checked)} />
              {textesConsent?.politique_confidentialite?.resume || 'J\'accepte la politique de confidentialité DjamSanté'}
            </label>
            {typeConsultation === 'teleconsultation' && (
              <label style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={consentTele} onChange={(e) => setConsentTele(e.target.checked)} />
                {textesConsent?.teleconsultation?.resume || 'J\'accepte la téléconsultation'}
              </label>
            )}
          </div>
          <Button
            onClick={handleRdv}
            disabled={creerRdv.isPending || !dateRdv || !heureRdv || !consentPolitique}
            style={{ marginTop: 12, width: '100%' }}
          >
            Demander un RDV
          </Button>
        </RdvCard>
      )}

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

        {!isPreview && isPatient && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontWeight: 600 }}>Laisser un avis</p>
          <StarSelect>
            {[1, 2, 3, 4, 5].map((s) => (
              <StarBtn key={s} type="button" $filled={s <= note} onClick={() => setNote(s)} aria-label={`${s} étoile${s > 1 ? 's' : ''}`}>★</StarBtn>
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
        )}
      </Card>
    </div>
  );
}
