import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Building2, Hospital, Pill, Stethoscope, Search, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useEtablissements } from '../hooks/useEtablissements';
import { useMedecins } from '../hooks/useMedecins';

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
  const [tab, setTab] = useState('etablissements');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data: etabData, isLoading: etabLoading, error: etabError, refetch: refetchEtab } = useEtablissements({
    type: typeFilter || undefined,
    recherche: search || undefined,
  });

  const { data: medData, isLoading: medLoading, error: medError, refetch: refetchMed } = useMedecins({
    recherche: search || undefined,
  });

  const etablissements = etabData?.etablissements || [];
  const medecins = medData?.medecins || [];

  return (
    <div>
      <PageHeader>
        <h1>Annuaire Santé</h1>
        <p>Pharmacies, hôpitaux, cliniques et médecins — notés par la communauté</p>
      </PageHeader>

      <Tabs>
        <Tab $active={tab === 'etablissements'} onClick={() => setTab('etablissements')}>
          <Building2 size={16} /> Établissements
        </Tab>
        <Tab $active={tab === 'medecins'} onClick={() => setTab('medecins')}>
          <Stethoscope size={16} /> Médecins
        </Tab>
      </Tabs>

      {tab === 'etablissements' && (
        <Tabs>
          <Tab $active={!typeFilter} onClick={() => setTypeFilter('')}>Tous</Tab>
          <Tab $active={typeFilter === 'pharmacie'} onClick={() => setTypeFilter('pharmacie')}>Pharmacies</Tab>
          <Tab $active={typeFilter === 'hopital'} onClick={() => setTypeFilter('hopital')}>Hôpitaux</Tab>
          <Tab $active={typeFilter === 'clinique'} onClick={() => setTypeFilter('clinique')}>Cliniques</Tab>
        </Tabs>
      )}

      <SearchBar>
        <SearchWrap>
          <Search />
          <input
            placeholder={tab === 'etablissements' ? 'Rechercher un établissement...' : 'Rechercher un médecin...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
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
                <Location><MapPin /> {e.ville}{e.adresse ? ` — ${e.adresse}` : ''}</Location>
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

      {tab === 'medecins' && (
        medLoading ? <Spinner /> :
        medError ? <ErrorState message="Impossible de charger les médecins" onRetry={refetchMed} /> :
        <Grid>
          {medecins.map((m) => (
            <ItemCard key={m.id} onClick={() => navigate(`/sante/medecin/${m.id}`)}>
              <TypeBadge $type="clinique"><Stethoscope size={12} /> {m.specialite}</TypeBadge>
              <CardTitle>Dr. {m.prenom} {m.nom}</CardTitle>
              {m.etablissement && (
                <Location><MapPin /> {m.etablissement.nom} — {m.etablissement.ville}</Location>
              )}
              <CardDesc>{m.bio}</CardDesc>
              <StarRating rating={m.note_moyenne} count={m.nombre_avis} />
              {m.competences?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {m.competences.slice(0, 3).map((c) => (
                    <span key={c} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, background: '#F1F5F9' }}>{c}</span>
                  ))}
                </div>
              )}
            </ItemCard>
          ))}
        </Grid>
      )}
    </div>
  );
}
