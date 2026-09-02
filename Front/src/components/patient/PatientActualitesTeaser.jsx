import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, ChevronRight, Trophy, Calendar } from 'lucide-react';
import Spinner from '../ui/Spinner';
import { usePublications } from '../../hooks/usePublications';
import { resolveFileUrl } from '../ui/PhotoUploadCard';
import { getActiveLocale } from '../../i18n/syncLanguage';

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ViewAll = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: none;
  background: none;
  padding: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[600]};
  cursor: pointer;
`;

const Track = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 2px 2px 6px;
  margin: 0 -2px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
`;

const NewsCard = styled.article`
  flex: 0 0 min(260px, 78vw);
  scroll-snap-align: start;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const Cover = styled.div`
  height: 120px;
  background: ${({ $url, theme }) => ($url
    ? `url(${$url}) center/cover`
    : `linear-gradient(135deg, ${theme.colors.primary[700]} 0%, ${theme.colors.primary[500]} 55%, #0B3D30 100%)`)};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.35) 100%);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.92);
  color: ${({ $achievement }) => ($achievement ? '#92400E' : '#0B3D30')};
  backdrop-filter: blur(6px);
`;

const CardBody = styled.div`
  padding: 14px 14px 16px;

  h3 {
    margin: 0 0 6px;
    font-size: 0.92rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  p {
    margin: 0;
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EmptyCard = styled.div`
  padding: 28px 20px;
  border-radius: 16px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  text-align: center;

  p {
    margin: 0;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

function stripText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

export default function PatientActualitesTeaser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locale = getActiveLocale();
  const { data, isLoading } = usePublications();
  const posts = (data?.publications || []).slice(0, 5);

  return (
    <div>
      <Head>
        <Title><Newspaper size={14} /> {t('patientHome.news_title')}</Title>
        <ViewAll type="button" onClick={() => navigate('/actualites')}>
          {t('patientHome.news_view_all')} <ChevronRight size={14} />
        </ViewAll>
      </Head>

      {isLoading && <Spinner size={20} text={t('actualites.loading')} />}

      {!isLoading && posts.length === 0 && (
        <EmptyCard>
          <p>{t('patientHome.news_empty')}</p>
        </EmptyCard>
      )}

      {!isLoading && posts.length > 0 && (
        <Track>
          {posts.map((post) => {
            const imgUrl = resolveFileUrl(post.image_url, post.fichier_image_id);
            const isAchievement = post.type === 'realisation';
            const dateStr = post.created_at || post.createdAt
              ? new Date(post.created_at || post.createdAt).toLocaleDateString(locale, {
                day: 'numeric', month: 'short',
              })
              : '';

            return (
              <NewsCard key={post.id} onClick={() => navigate('/actualites')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/actualites')}>
                <Cover $url={imgUrl}>
                  <Badge $achievement={isAchievement}>
                    {isAchievement ? <><Trophy size={10} /> {t('actualites.type_achievement')}</> : t('actualites.type_news')}
                  </Badge>
                </Cover>
                <CardBody>
                  <h3>{post.titre}</h3>
                  <p>{stripText(post.contenu)}</p>
                  {dateStr && (
                    <Meta><Calendar size={11} /> {dateStr}</Meta>
                  )}
                </CardBody>
              </NewsCard>
            );
          })}
        </Track>
      )}
    </div>
  );
}
