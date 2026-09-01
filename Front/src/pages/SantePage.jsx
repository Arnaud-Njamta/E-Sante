import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import useDebounce from '../hooks/useDebounce';
import useGeolocation from '../hooks/useGeolocation';
import { parseJsonArray } from '../utils/helpers';
import { resolveFileUrl } from '../components/ui/PhotoUploadCard';

const NearbyBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding: 12px 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary[50] || '#ECFDF5'};
  border: 1px solid ${({ theme }) => theme.colors.primary[100] || '#A7F3D0'};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
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

const TYPE_ICONS = {
  pharmacie: Pill,
  hopital: Hospital,
  clinique: Building2,
};

export default function SantePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const typeLabels = useMemo(() => ({
    pharmacie: t('sante.type_pharmacie'),
    hopital: t('sante.type_hopital'),
    clinique: t('sante.type_clinique'),
  }), [t]);
  const initialTab = searchParams.get('tab');
  const initialQ = searchParams.get('q') || '';
  const [tab, setTab] = useState(() => {
    if (initialTab === 'medecins') return 'medecins';
    if (initialTab === 'medicaments') return 'medicaments';
    return 'etablissements';
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'medecins' || tabParam === 'medicaments') setTab(tabParam);
    else if (!tabParam) setTab('etablissements');
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState(initialQ);
  const debouncedSearch = useDebounce(search, 350);
  const [villeMed, setVilleMed] = useState('');
  const [typeMed, setTypeMed] = useState('');
  const [dispoOnly, setDispoOnly] = useState(false);
  const [competenceFilter, setCompetenceFilter] = useState('');
  const [etablissementFilter, setEtablissementFilter] = useState('');
  const {
    coords, cityLabel, loading: geoLoading, hasLocation,
  } = useGeolocation({ enabled: tab === 'etablissements' });

  const etabFilters = {
    type: typeFilter || undefined,
    recherche: search || undefined,
    limit: 50,
    ...(hasLocation && coords
      ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        nearby: true,
        radius_km: 25,
        ville: cityLabel || undefined,
      }
      : cityLabel
        ? { ville: cityLabel }
        : {}),
  };

  const { data: etabData, isLoading: etabLoading, error: etabError, refetch: refetchEtab } = useEtablissements(
    etabFilters,
    { enabled: tab === 'etablissements' || tab === 'medecins' },
  );

  const etabOptions = (etabData?.etablissements || []).filter(
    (e) => e.type === 'hopital' || e.type === 'clinique',
  );

  const { data: medData, isLoading: medLoading, error: medError, refetch: refetchMed } = useMedecins({
    recherche: search || undefined,
    disponible_maintenant: dispoOnly || undefined,
    competence: competenceFilter || undefined,
    etablissement_id: etablissementFilter || undefined,
  }, { enabled: tab === 'medecins' });

  const { data: produitsData, isLoading: prodLoading, error: prodError, refetch: refetchProd } = useRechercheProduits(
    {
      recherche: tab === 'medicaments' ? debouncedSearch.trim() : '',
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
        <h1>{t('sante.title')}</h1>
        <p>{t('sante.subtitle')}</p>
      </PageHeader>

      {tab === 'etablissements' && (
        <NearbyBar>
          <MapPin size={16} />
          {geoLoading && !hasLocation
            ? t('sante.geo_loading')
            : cityLabel
              ? t('sante.geo_near', { city: cityLabel })
              : t('sante.geo_default')}
        </NearbyBar>
      )}

      <Tabs>
        <Tab $active={tab === 'etablissements'} onClick={() => setTab('etablissements')}>
          <Building2 size={16} /> {t('sante.tab_establishments')}
        </Tab>
        <Tab $active={tab === 'medecins'} onClick={() => setTab('medecins')}>
          <Stethoscope size={16} /> {t('sante.tab_doctors')}
        </Tab>
        <Tab $active={tab === 'medicaments'} onClick={() => setTab('medicaments')}>
          <Pill size={16} /> {t('sante.tab_medicines')}
        </Tab>
      </Tabs>

      {tab === 'medicaments' && (
        <Tabs>
          <Tab $active={!typeMed} onClick={() => setTypeMed('')}>{t('sante.all')}</Tab>
          <Tab $active={typeMed === 'pharmacie'} onClick={() => setTypeMed('pharmacie')}>{t('sante.pharmacies')}</Tab>
          <Tab $active={typeMed === 'clinique'} onClick={() => setTypeMed('clinique')}>{t('sante.clinics')}</Tab>
          <Tab $active={typeMed === 'hopital'} onClick={() => setTypeMed('hopital')}>{t('sante.hospitals')}</Tab>
        </Tabs>
      )}

      {tab === 'etablissements' && (
        <Tabs>
          <Tab $active={!typeFilter} onClick={() => setTypeFilter('')}>{t('sante.all')}</Tab>
          <Tab $active={typeFilter === 'pharmacie'} onClick={() => setTypeFilter('pharmacie')}>{t('sante.pharmacies')}</Tab>
          <Tab $active={typeFilter === 'hopital'} onClick={() => setTypeFilter('hopital')}>{t('sante.hospitals')}</Tab>
          <Tab $active={typeFilter === 'clinique'} onClick={() => setTypeFilter('clinique')}>{t('sante.clinics')}</Tab>
        </Tabs>
      )}

      {tab === 'medecins' && (
        <Tabs>
          <Tab $active={!dispoOnly} onClick={() => setDispoOnly(false)}>{t('sante.all')}</Tab>
          <Tab $active={dispoOnly} onClick={() => setDispoOnly(true)}>{t('sante.available_now')}</Tab>
        </Tabs>
      )}

      <SearchBar>
        <SearchWrap>
          <Search />
          <input
            placeholder={
              tab === 'medicaments' ? t('sante.search_medicine')
                : tab === 'etablissements' ? t('sante.search_establishment')
                  : t('sante.search_doctor')
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        {tab === 'medicaments' && (
          <>
            <input
              placeholder={cityLabel ? t('sante.city_optional', { city: cityLabel }) : t('sante.city_douala')}
              value={villeMed}
              onChange={(e) => setVilleMed(e.target.value)}
              style={{ width: 200, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8 }}
            />
            {villeMed && (
              <button
                type="button"
                onClick={() => setVilleMed('')}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {t('sante.all_cities')}
              </button>
            )}
          </>
        )}
        {tab === 'medecins' && (
          <>
            <input
              placeholder={t('sante.competence')}
              value={competenceFilter}
              onChange={(e) => setCompetenceFilter(e.target.value)}
              style={{ width: 200, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8 }}
            />
            <select
              value={etablissementFilter}
              onChange={(e) => setEtablissementFilter(e.target.value)}
              style={{ width: 220, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8 }}
            >
              <option value="">{t('sante.all_establishments')}</option>
              {etabOptions.map((e) => (
                <option key={e.id} value={e.id}>{e.nom} ({e.ville})</option>
              ))}
            </select>
          </>
        )}
      </SearchBar>

      {tab === 'etablissements' && (
        (etabLoading && !etabData) ? <Spinner /> :
        etabError ? (
          <ErrorState
            message={t('sante.load_establishments_error', {
              detail: etabError.response?.data?.message || t('sante.check_connection'),
            })}
            onRetry={refetchEtab}
          />
        ) :
        <Grid>
          {etablissements.length === 0 && !etabLoading && (
            <Card style={{ padding: 32, gridColumn: '1 / -1', textAlign: 'center', color: '#94A3B8' }}>
              {cityLabel
                ? t('sante.no_establishment_city', { city: cityLabel })
                : t('sante.no_establishment')}
            </Card>
          )}
          {etablissements.map((e) => {
            const Icon = TYPE_ICONS[e.type] || Building2;
            return (
              <ItemCard key={e.id} onClick={() => navigate(`/sante/etablissement/${e.id}`)}>
                <TypeBadge $type={e.type}><Icon size={12} /> {typeLabels[e.type]}</TypeBadge>
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
                    <ServiceCount>
                      {t(e.services.length === 1 ? 'sante.services_one' : 'sante.services_other', { count: e.services.length })}
                    </ServiceCount>
                  </div>
                )}
              </ItemCard>
            );
          })}
        </Grid>
      )}

      {tab === 'medicaments' && (
        prodLoading || (search.trim() !== debouncedSearch.trim()) ? <Spinner /> :
        prodError ? <ErrorState message={t('sante.load_medicines_error')} onRetry={refetchProd} /> :
        (
          <>
            {!search.trim() && (
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: 16 }}>
                {t('sante.medicines_hint')}
              </p>
            )}
            <Grid>
              {(produitsData || []).map((p) => {
                const etab = p.etablissement || p.pharmacie;
                const Icon = TYPE_ICONS[etab?.type] || Pill;
                const imgSrc = resolveFileUrl(p.image_url, p.fichier_image_id);
                return (
                  <ItemCard key={p.id} onClick={() => etab && navigate(`/sante/etablissement/${etab.id}?ajouter=${p.id}`)}>
                    {imgSrc && (
                      <img src={imgSrc} alt={p.nom} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    )}
                    <CardTitle>{p.nom}</CardTitle>
                    {etab && (
                      <TypeBadge $type={etab.type}><Icon size={12} /> {typeLabels[etab.type]} — {etab.nom}</TypeBadge>
                    )}
                    <Location><MapPin /> {etab?.ville}{etab?.adresse ? ` — ${etab.adresse}` : ''}</Location>
                    <strong style={{ color: '#059669', fontSize: '1rem' }}>{Number(p.prix_fcfa || 0).toLocaleString()} FCFA</strong>
                    <ServiceCount style={{ display: 'block', marginTop: 6 }}>
                      {t('sante.in_stock', { count: p.stock_disponible })}
                      {p.necessite_ordonnance && t('sante.prescription_required')}
                    </ServiceCount>
                  </ItemCard>
                );
              })}
            </Grid>
            {(produitsData || []).length === 0 && (
              <Card style={{ padding: 32, marginTop: 16, textAlign: 'center', color: '#94A3B8' }}>
                {debouncedSearch.trim()
                  ? t('sante.no_medicine_search', {
                    query: debouncedSearch,
                    city: villeMed ? t('sante.in_city', { city: villeMed }) : '',
                  })
                  : t('sante.no_medicine_stock')}
              </Card>
            )}
          </>
        )
      )}

      {tab === 'medecins' && (
        medLoading ? <Spinner /> :
        medError ? <ErrorState message={t('sante.load_doctors_error')} onRetry={refetchMed} /> :
        <Grid>
          {medecins.map((m) => {
            const competences = parseJsonArray(m.competences);
            return (
            <ItemCard key={m.id} onClick={() => navigate(`/sante/medecin/${m.id}`)}>
              <TypeBadge $type="clinique"><Stethoscope size={12} /> {m.specialite}</TypeBadge>
              <CardTitle>Dr. {m.prenom} {m.nom}</CardTitle>
              {m.disponible_maintenant && (
                <span style={{ display: 'inline-block', marginBottom: 6, padding: '2px 8px', borderRadius: 12, background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', fontWeight: 600 }}>
                  {t('sante.available')}
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
