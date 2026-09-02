import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Building2, Hospital, Pill, Stethoscope, Search, MapPin, Moon } from 'lucide-react';
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
import { PROFESSION_LABELS, PROFESSIONS_LIST } from '../config/cameroonSpecialties';

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

const GardeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
  background: #FEF3C7;
  color: #92400E;
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
  const initialType = searchParams.get('type');
  const initialQ = searchParams.get('q') || '';
  const initialProfession = searchParams.get('profession') || '';
  const initialDeGarde = searchParams.get('de_garde') === '1' || searchParams.get('de_garde') === 'true';
  const [tab, setTab] = useState(() => {
    if (initialTab === 'soignants' || initialTab === 'medecins') return 'soignants';
    if (initialTab === 'medicaments') return 'medicaments';
    return 'etablissements';
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'soignants' || tabParam === 'medecins') setTab('soignants');
    else if (tabParam === 'medicaments') setTab('medicaments');
    else if (!tabParam) setTab('etablissements');
  }, [searchParams]);

  useEffect(() => {
    const prof = searchParams.get('profession');
    if (PROFESSIONS_LIST.includes(prof)) setProfessionFilter(prof);
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  const validTypes = ['pharmacie', 'hopital', 'clinique'];
  const [typeFilter, setTypeFilter] = useState(() => (
    validTypes.includes(initialType) ? initialType : ''
  ));
  const [search, setSearch] = useState(initialQ);
  const debouncedSearch = useDebounce(search, 350);
  const [villeMed, setVilleMed] = useState('');
  const [typeMed, setTypeMed] = useState('');
  const [dispoOnly, setDispoOnly] = useState(false);
  const [competenceFilter, setCompetenceFilter] = useState('');
  const [etablissementFilter, setEtablissementFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState(() => (
    PROFESSIONS_LIST.includes(initialProfession) ? initialProfession : ''
  ));
  const [deGardeOnly, setDeGardeOnly] = useState(initialDeGarde);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (validTypes.includes(typeParam)) {
      setTypeFilter(typeParam);
      setTab('etablissements');
    }
    const dg = searchParams.get('de_garde');
    if (dg === '1' || dg === 'true') {
      setDeGardeOnly(true);
      setTab('etablissements');
      if (!typeParam) setTypeFilter('pharmacie');
    }
  }, [searchParams]);

  const {
    coords, cityLabel, loading: geoLoading, hasLocation,
  } = useGeolocation({ enabled: true });

  const geoParams = hasLocation && coords
    ? {
      latitude: coords.latitude,
      longitude: coords.longitude,
      nearby: true,
      radius_km: 30,
    }
    : {};

  const etabFilters = {
    type: typeFilter || undefined,
    recherche: search || undefined,
    de_garde: deGardeOnly || undefined,
    limit: 50,
    ...geoParams,
    ...(!hasLocation && cityLabel ? { ville: cityLabel } : {}),
  };

  const { data: etabData, isLoading: etabLoading, error: etabError, refetch: refetchEtab } = useEtablissements(
    etabFilters,
    { enabled: tab === 'etablissements' || tab === 'soignants' },
  );

  const etabOptions = (etabData?.etablissements || []).filter(
    (e) => e.type === 'hopital' || e.type === 'clinique',
  );

  const { data: medData, isLoading: medLoading, error: medError, refetch: refetchMed } = useMedecins({
    recherche: search || undefined,
    disponible_maintenant: dispoOnly || undefined,
    competence: competenceFilter || undefined,
    etablissement_id: etablissementFilter || undefined,
    profession: professionFilter || undefined,
    ...geoParams,
  }, { enabled: tab === 'soignants' });

  const { data: produitsData, isLoading: prodLoading, error: prodError, refetch: refetchProd } = useRechercheProduits(
    {
      recherche: tab === 'medicaments' ? debouncedSearch.trim() : '',
      ville: !hasLocation && villeMed ? villeMed : undefined,
      type_etablissement: typeMed || undefined,
      ...geoParams,
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

      <NearbyBar>
        <MapPin size={16} />
        {geoLoading && !hasLocation
          ? t('sante.geo_loading')
          : hasLocation
            ? t('sante.geo_gps_active')
            : cityLabel
              ? t('sante.geo_near', { city: cityLabel })
              : t('sante.geo_default')}
      </NearbyBar>

      <Tabs>
        <Tab $active={tab === 'etablissements'} onClick={() => setTab('etablissements')}>
          <Building2 size={16} /> {t('sante.tab_establishments')}
        </Tab>
        <Tab $active={tab === 'soignants'} onClick={() => setTab('soignants')}>
          <Stethoscope size={16} /> {t('sante.tab_caregivers')}
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
          {(typeFilter === 'pharmacie' || !typeFilter) && (
            <Tab $active={deGardeOnly} onClick={() => setDeGardeOnly((v) => !v)}>
              <Moon size={14} /> {t('sante.on_duty')}
            </Tab>
          )}
        </Tabs>
      )}

      {tab === 'soignants' && (
        <Tabs>
          <Tab $active={!professionFilter} onClick={() => setProfessionFilter('')}>{t('sante.all_caregivers')}</Tab>
          {PROFESSIONS_LIST.map((p) => (
            <Tab key={p} $active={professionFilter === p} onClick={() => setProfessionFilter(p)}>
              {PROFESSION_LABELS[p]}
            </Tab>
          ))}
        </Tabs>
      )}

      {tab === 'soignants' && (
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
                  : t('sante.search_caregiver')
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        {tab === 'medicaments' && !hasLocation && (
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
        {tab === 'soignants' && (
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
                {e.de_garde && (
                  <GardeBadge><Moon size={11} /> {t('sante.on_duty_badge')}</GardeBadge>
                )}
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
                    <Location><MapPin /> {etab?.ville}{etab?.adresse ? ` — ${etab.adresse}` : ''}
                      {(p.distance_km ?? etab?.distance_km) != null && (
                        <DistBadge>
                          {(p.distance_km ?? etab.distance_km) < 1
                            ? `${Math.round((p.distance_km ?? etab.distance_km) * 1000)} m`
                            : `${p.distance_km ?? etab.distance_km} km`}
                        </DistBadge>
                      )}
                      {etab?.de_garde && <GardeBadge><Moon size={11} /> {t('sante.on_duty_badge')}</GardeBadge>}
                    </Location>
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

      {tab === 'soignants' && (
        medLoading ? <Spinner /> :
        medError ? <ErrorState message={t('sante.load_caregivers_error')} onRetry={refetchMed} /> :
        <Grid>
          {medecins.map((m) => {
            const competences = parseJsonArray(m.competences);
            const profLabel = PROFESSION_LABELS[m.profession] || m.specialite;
            const namePrefix = m.profession === 'medecin' ? 'Dr. ' : '';
            return (
            <ItemCard key={m.id} onClick={() => navigate(`/sante/medecin/${m.id}`)}>
              <TypeBadge $type="clinique"><Stethoscope size={12} /> {profLabel}</TypeBadge>
              <CardTitle>{namePrefix}{m.prenom} {m.nom}</CardTitle>
              {m.specialite && m.profession !== 'medecin' && (
                <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#64748B' }}>{m.specialite}</p>
              )}
              {m.disponible_maintenant && (
                <span style={{ display: 'inline-block', marginBottom: 6, padding: '2px 8px', borderRadius: 12, background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', fontWeight: 600 }}>
                  {t('sante.available')}
                </span>
              )}
              {m.joignable_urgence && (
                <span style={{ display: 'inline-block', marginBottom: 6, marginLeft: 6, padding: '2px 8px', borderRadius: 12, background: '#FEE2E2', color: '#991B1B', fontSize: '0.7rem', fontWeight: 600 }}>
                  {t('sante.emergency_reachable')}
                </span>
              )}
              {(m.etablissement || m.distance_km != null) && (
                <Location>
                  <MapPin />
                  {m.etablissement ? `${m.etablissement.nom} — ${m.etablissement.ville}` : t('sante.home_care')}
                  {m.distance_km != null && (
                    <DistBadge>
                      {m.distance_km < 1 ? `${Math.round(m.distance_km * 1000)} m` : `${m.distance_km} km`}
                    </DistBadge>
                  )}
                </Location>
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
