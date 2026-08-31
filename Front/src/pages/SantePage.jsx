import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Building2, Hospital, Pill, Stethoscope, Search, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useEtablissements } from '../hooks/useEtablissements';
import { useMedecins } from '../hooks/useMedecins';
import { useRechercheProduits } from '../hooks/useProduits';
import useGeolocation from '../hooks/useGeolocation';
import { parseJsonArray } from '../utils/helpers';
import { resolveFileUrl } from '../components/ui/PhotoUploadCard';

const NearbyBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding: 12px 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary[50] || '#ECFDF5'};
  border: 1px solid ${({ theme }) => theme.colors.primary[100] || '#A7F3D0'};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  button {
    border: none;
    background: ${({ theme }) => theme.colors.primary[600] || '#059669'};
    color: #fff;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
  }
`;

const DistBadge = styled.span`
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
  background: #DCFCE7;
  color: #166534;
`;


const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 4px; }
  p { color: ${({ theme }) => theme.colors.textSecondary}; margin: 0; }
`;

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary[500] : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primary[50] : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary[600] : theme.colors.textSecondary)};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  input {
    flex: 1;
    padding: 10px 14px 10px 40px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    font-size: 0.9rem;
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SearchWrap = styled.div`
  flex: 1;
  position: relative;
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ItemCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme, $type }) => {
    if ($type === 'pharmacie') return theme.colors.primary[50];
    if ($type === 'hopital') return '#FEE2E2';
    return '#E0E7FF';
  }};
  color: ${({ theme, $type }) => {
    if ($type === 'pharmacie') return theme.colors.primary[600];
    if ($type === 'hopital') return '#DC2626';
    return '#4338CA';
  }};
  margin-bottom: 8px;
`;

const CardTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 600;
`;

const CardDesc = styled.p`
  margin: 0 0 10px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 8px;
  svg { width: 14px; }
`;

const ServiceCount = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.primary[500]};
  font-weight: 500;
`;

const TYPE_LABELS = {
  pharmacie: 'Pharmacie',
  hopital: 'Hôpital',
  clinique: 'Clinique',
};

const TYPE_ICONS = {
  pharmacie: Pill,
  hopital: Hospital,
  clinique: Building2,
};

export default function SantePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const initialQ = searchParams.get('q') || '';
  const [tab, setTab] = useState(() => {
    if (initialTab === 'medecins') return 'medecins';
    if (initialTab === 'medicaments') return 'medicaments';
    return 'etablissements';
  });

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'medecins' || t === 'medicaments') setTab(t);
    else if (!t) setTab('etablissements');
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState(initialQ);
  const [villeMed, setVilleMed] = useState('');
  const [typeMed, setTypeMed] = useState('');
  const [dispoOnly, setDispoOnly] = useState(false);
  const [competenceFilter, setCompetenceFilter] = useState('');
  const [etablissementFilter, setEtablissementFilter] = useState('');
  const [nearbyOn, setNearbyOn] = useState(true);
  const { coords, error: geoError, loading: geoLoading, refresh: refreshGeo } = useGeolocation({
    enabled: nearbyOn && tab === 'etablissements',
  });

  const { data: etabListData } = useEtablissements({
    type: undefined,
    limit: 100,
  });
  const etabOptions = (etabListData?.etablissements || []).filter(
    (e) => e.type === 'hopital' || e.type === 'clinique',
  );

  const { data: etabData, isLoading: etabLoading, error: etabError, refetch: refetchEtab } = useEtablissements({
    type: typeFilter || undefined,
    recherche: search || undefined,
    ...(nearbyOn && coords
      ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        nearby: true,
        radius_km: 30,
        limit: 50,
      }
      : {}),
  });

  const { data: medData, isLoading: medLoading, error: medError, refetch: refetchMed } = useMedecins({
    recherche: search || undefined,
    disponible_maintenant: dispoOnly || undefined,
    competence: competenceFilter || undefined,
    etablissement_id: etablissementFilter || undefined,
  });

  const { data: produitsData, isLoading: prodLoading, error: prodError, refetch: refetchProd } = useRechercheProduits(
    {
      recherche: tab === 'medicaments' ? search.trim() : '',
      ville: villeMed || undefined,
      type_etablissement: typeMed || undefined,
    },
    { enabled: tab === 'medicaments' },
  );

  const etablissements = etabData?.etablissements || [];
  const medecins = medData?.medecins || [];

  return (
    <div>
      <PageHeader>
        <h1>Annuaire Santé</h1>
        <p>Pharmacies, hôpitaux, cliniques, soignants et médicaments — près de vous</p>
      </PageHeader>

      {tab === 'etablissements' && (
        <NearbyBar>
          <MapPin size={16} />
          {nearbyOn && coords
            ? `Tri par proximité (±30 km) — précision ~${Math.round(coords.accuracy || 0)} m`
            : geoLoading
              ? 'Localisation en cours…'
              : geoError
                ? `Localisation : ${geoError}`
                : 'Activez la localisation pour voir les établissements les plus proches'}
          <button type="button" onClick={() => { setNearbyOn(true); refreshGeo(); }}>
            Me localiser
          </button>
          {nearbyOn && (
            <button
              type="button"
              style={{ background: '#64748B' }}
              onClick={() => setNearbyOn(false)}
            >
              Voir tout
            </button>
          )}
        </NearbyBar>
      )}

      <Tabs>
        <Tab $active={tab === 'etablissements'} onClick={() => setTab('etablissements')}>
          <Building2 size={16} /> Établissements
        </Tab>
        <Tab $active={tab === 'medecins'} onClick={() => setTab('medecins')}>
          <Stethoscope size={16} /> Médecins
        </Tab>
        <Tab $active={tab === 'medicaments'} onClick={() => setTab('medicaments')}>
          <Pill size={16} /> Médicaments
        </Tab>
      </Tabs>

      {tab === 'medicaments' && (
        <Tabs>
          <Tab $active={!typeMed} onClick={() => setTypeMed('')}>Tous</Tab>
          <Tab $active={typeMed === 'pharmacie'} onClick={() => setTypeMed('pharmacie')}>Pharmacies</Tab>
          <Tab $active={typeMed === 'clinique'} onClick={() => setTypeMed('clinique')}>Cliniques</Tab>
          <Tab $active={typeMed === 'hopital'} onClick={() => setTypeMed('hopital')}>Hôpitaux</Tab>
        </Tabs>
      )}

      {tab === 'etablissements' && (
        <Tabs>
          <Tab $active={!typeFilter} onClick={() => setTypeFilter('')}>Tous</Tab>
          <Tab $active={typeFilter === 'pharmacie'} onClick={() => setTypeFilter('pharmacie')}>Pharmacies</Tab>
          <Tab $active={typeFilter === 'hopital'} onClick={() => setTypeFilter('hopital')}>Hôpitaux</Tab>
          <Tab $active={typeFilter === 'clinique'} onClick={() => setTypeFilter('clinique')}>Cliniques</Tab>
        </Tabs>
      )}

      {tab === 'medecins' && (
        <Tabs>
          <Tab $active={!dispoOnly} onClick={() => setDispoOnly(false)}>Tous</Tab>
          <Tab $active={dispoOnly} onClick={() => setDispoOnly(true)}>Disponibles maintenant</Tab>
        </Tabs>
      )}

      <SearchBar>
        <SearchWrap>
          <Search />
          <input
            placeholder={
              tab === 'medicaments' ? 'Rechercher un médicament (ex. Paracetamol, Amoxicilline)...'
                : tab === 'etablissements' ? 'Rechercher un établissement...'
                  : 'Rechercher un médecin...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        {tab === 'medicaments' && (
          <input
            placeholder="Ville (ex. Douala)"
            value={villeMed}
            onChange={(e) => setVilleMed(e.target.value)}
            style={{ width: 160, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8 }}
          />
        )}
        {tab === 'medecins' && (
          <>
            <input
              placeholder="Compétence (ex. Cardiologie)"
              value={competenceFilter}
              onChange={(e) => setCompetenceFilter(e.target.value)}
              style={{ width: 200, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8 }}
            />
            <select
              value={etablissementFilter}
              onChange={(e) => setEtablissementFilter(e.target.value)}
              style={{ width: 220, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8 }}
            >
              <option value="">Tous les établissements</option>
              {etabOptions.map((e) => (
                <option key={e.id} value={e.id}>{e.nom} ({e.ville})</option>
              ))}
            </select>
          </>
        )}
      </SearchBar>

      {tab === 'etablissements' && (
        etabLoading ? <Spinner /> :
        etabError ? <ErrorState message="Impossible de charger les établissements" onRetry={refetchEtab} /> :
        <Grid>
          {etablissements.map((e) => {
            const Icon = TYPE_ICONS[e.type] || Building2;
            return (
              <ItemCard key={e.id} onClick={() => navigate(`/sante/etablissement/${e.id}`)}>
                <TypeBadge $type={e.type}><Icon size={12} /> {TYPE_LABELS[e.type]}</TypeBadge>
                <CardTitle>{e.nom}</CardTitle>
                <Location>
                  <MapPin /> {e.ville}{e.adresse ? ` — ${e.adresse}` : ''}
                  {e.distance_km != null && (
                    <DistBadge>{e.distance_km < 1 ? `${Math.round(e.distance_km * 1000)} m` : `${e.distance_km} km`}</DistBadge>
                  )}
                </Location>
                <CardDesc>{e.description}</CardDesc>
                <StarRating rating={e.note_moyenne} count={e.nombre_avis} />
                {e.services?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <ServiceCount>{e.services.length} service{e.services.length > 1 ? 's' : ''} disponible{e.services.length > 1 ? 's' : ''}</ServiceCount>
                  </div>
                )}
              </ItemCard>
            );
          })}
        </Grid>
      )}

      {tab === 'medicaments' && (
        prodLoading ? <Spinner /> :
        prodError ? <ErrorState message="Impossible de charger les médicaments" onRetry={refetchProd} /> :
        (
          <>
            {!search.trim() && (
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: 16 }}>
                Médicaments disponibles dans les pharmacies et dispensaires — utilisez la recherche pour affiner.
              </p>
            )}
            <Grid>
              {(produitsData || []).map((p) => {
                const etab = p.etablissement || p.pharmacie;
                const Icon = TYPE_ICONS[etab?.type] || Pill;
                const imgSrc = resolveFileUrl(p.image_url, p.fichier_image_id);
                return (
                  <ItemCard key={p.id} onClick={() => etab && navigate(`/sante/etablissement/${etab.id}`)}>
                    {imgSrc && (
                      <img src={imgSrc} alt={p.nom} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    )}
                    <CardTitle>{p.nom}</CardTitle>
                    {etab && (
                      <TypeBadge $type={etab.type}><Icon size={12} /> {TYPE_LABELS[etab.type]} — {etab.nom}</TypeBadge>
                    )}
                    <Location><MapPin /> {etab?.ville}{etab?.adresse ? ` — ${etab.adresse}` : ''}</Location>
                    <strong style={{ color: '#059669', fontSize: '1rem' }}>{Number(p.prix_fcfa || 0).toLocaleString()} FCFA</strong>
                    <ServiceCount style={{ display: 'block', marginTop: 6 }}>
                      En stock : {p.stock_disponible}
                      {p.necessite_ordonnance && ' · Ordonnance requise'}
                    </ServiceCount>
                  </ItemCard>
                );
              })}
            </Grid>
            {(produitsData || []).length === 0 && (
              <Card style={{ padding: 32, marginTop: 16, textAlign: 'center', color: '#94A3B8' }}>
                {search.trim()
                  ? <>Aucun médicament trouvé pour « {search} »{villeMed ? ` à ${villeMed}` : ''}.</>
                  : <>Aucun médicament en stock pour le moment. Les établissements peuvent alimenter leur dispensaire depuis leur espace pro.</>}
              </Card>
            )}
          </>
        )
      )}

      {tab === 'medecins' && (
        medLoading ? <Spinner /> :
        medError ? <ErrorState message="Impossible de charger les médecins" onRetry={refetchMed} /> :
        <Grid>
          {medecins.map((m) => {
            const competences = parseJsonArray(m.competences);
            return (
            <ItemCard key={m.id} onClick={() => navigate(`/sante/medecin/${m.id}`)}>
              <TypeBadge $type="clinique"><Stethoscope size={12} /> {m.specialite}</TypeBadge>
              <CardTitle>Dr. {m.prenom} {m.nom}</CardTitle>
              {m.disponible_maintenant && (
                <span style={{ display: 'inline-block', marginBottom: 6, padding: '2px 8px', borderRadius: 12, background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', fontWeight: 600 }}>
                  Disponible
                </span>
              )}
              {m.etablissement && (
                <Location><MapPin /> {m.etablissement.nom} — {m.etablissement.ville}</Location>
              )}
              <CardDesc>{m.bio}</CardDesc>
              <StarRating rating={m.note_moyenne} count={m.nombre_avis} />
              {competences.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {competences.slice(0, 3).map((c) => (
                    <span key={c} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, background: '#F1F5F9' }}>{c}</span>
                  ))}
                </div>
              )}
            </ItemCard>
          );
          })}
        </Grid>
      )}
    </div>
  );
}
