import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Newspaper, Trophy, ArrowLeft, Plus, Sparkles, Image as ImageIcon,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import PublicationFeedCard from '../components/publications/PublicationFeedCard';
import { usePublications, useCreerPublication } from '../hooks/usePublications';
import { useAuth } from '../context/AuthContext';
import { getHomeRoute } from '../config/branding';

const Page = styled.div`
  max-width: 1080px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

const Hero = styled.header`
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  .kicker {
    margin: 0 0 10px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  h1 {
    margin: 0 0 10px;
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-size: clamp(1.85rem, 4vw, 2.5rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.12;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    max-width: 580px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: 9px 16px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.ink : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.ink : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.textSecondary)};
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    border-color: ${({ theme }) => theme.colors.ink};
    color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.ink)};
  }
`;

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const PublishCard = styled(Card)`
  padding: 28px;
  margin-bottom: 28px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  h3 {
    margin: 0 0 18px;
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-size: 1.25rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const PublishTextarea = styled.textarea`
  width: 100%;
  padding: 12px 0;
  margin-top: 12px;
  border: none;
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.border};
  font-size: 0.88rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  resize: vertical;
  outline: none;
  &:focus { border-bottom-color: ${({ theme }) => theme.colors.deep}; }
`;

export default function ActualitesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, role, isMedecin, isPharmacie, isHopital, isClinique } = useAuth();
  const [filtre, setFiltre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = usePublications({ type: filtre || undefined });
  const creer = useCreerPublication();
  const [form, setForm] = useState({ type: 'actualite', titre: '', contenu: '', mis_en_avant: false });
  const [image, setImage] = useState(null);

  const canPublish = isMedecin || isPharmacie || isHopital || isClinique;
  const homeRoute = isAuthenticated ? getHomeRoute(role) : '/login';
  const backLabel = isAuthenticated ? t('actualites.back_home') : t('actualites.back_login');

  const filters = [
    { v: '', l: t('actualites.filter_all'), icon: Sparkles },
    { v: 'actualite', l: t('actualites.filter_news'), icon: Newspaper },
    { v: 'realisation', l: t('actualites.filter_achievements'), icon: Trophy },
  ];

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      await creer.mutateAsync({ payload: form, image });
      toast.success(t('actualites.publish_success'));
      setShowForm(false);
      setForm({ type: 'actualite', titre: '', contenu: '', mis_en_avant: false });
      setImage(null);
    } catch {
      toast.error(t('actualites.publish_error'));
    }
  };

  if (isLoading) return <Spinner text={t('actualites.loading')} />;

  return (
    <Page>
      <TopBar>
        <BackBtn type="button" onClick={() => navigate(homeRoute)}>
          <ArrowLeft size={18} />
          {backLabel}
        </BackBtn>
        {canPublish && (
          <Button onClick={() => setShowForm(!showForm)} icon={showForm ? undefined : Plus}>
            {showForm ? t('common.cancel') : t('actualites.publish')}
          </Button>
        )}
      </TopBar>

      <Hero>
        <p className="kicker">{t('actualites.kicker')}</p>
        <h1><Newspaper size={28} strokeWidth={1.5} /> {t('actualites.title')}</h1>
        <p>{t('actualites.subtitle')}</p>
      </Hero>

      <FilterRow>
        {filters.map((f) => (
          <FilterChip key={f.v} type="button" $active={filtre === f.v} onClick={() => setFiltre(f.v)}>
            <f.icon size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {f.l}
          </FilterChip>
        ))}
      </FilterRow>

      {showForm && (
        <PublishCard>
          <h3>{t('actualites.new_publication')}</h3>
          <form onSubmit={handlePublish}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="radio" checked={form.type === 'actualite'} onChange={() => setForm({ ...form, type: 'actualite' })} /> {t('actualites.type_news')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="radio" checked={form.type === 'realisation'} onChange={() => setForm({ ...form, type: 'realisation' })} /> {t('actualites.type_achievement')}
              </label>
            </div>
            <Input label={t('actualites.form_title')} value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            <PublishTextarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} rows={4} placeholder={t('actualites.form_content_placeholder')} required />
            <label style={{ display: 'block', marginTop: 12, fontSize: '0.85rem', color: '#64748B' }}>
              <ImageIcon size={14} style={{ verticalAlign: 'middle' }} /> {t('actualites.photo_optional')}
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ display: 'block', marginTop: 6 }} />
            </label>
            <Button type="submit" style={{ marginTop: 16 }} disabled={creer.isPending}>
              {creer.isPending ? t('actualites.publishing') : t('actualites.publish_feed')}
            </Button>
          </form>
        </PublishCard>
      )}

      {(data?.publications || []).length > 0 ? (
        <FeedGrid>
          {data.publications.map((p) => (
            <PublicationFeedCard
              key={p.id}
              post={p}
              onClick={() => navigate(`/actualites/${p.id}`)}
            />
          ))}
        </FeedGrid>
      ) : (
        <EmptyState
          icon={Newspaper}
          title={t('actualites.empty_title')}
          description={t('actualites.empty_desc')}
        />
      )}
    </Page>
  );
}
