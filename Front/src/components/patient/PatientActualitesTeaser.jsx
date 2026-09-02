import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, ChevronRight, Trophy } from 'lucide-react';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { usePublications } from '../../hooks/usePublications';

const Wrap = styled(Card)`
  padding: 18px 20px;
  margin-bottom: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ViewAll = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  padding: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary[600]};
  cursor: pointer;
`;

const Post = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: none;
  cursor: pointer;

  &:first-of-type { border-top: none; padding-top: 0; }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.primary[600]};
    margin-bottom: 4px;
  }

  strong {
    display: block;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.35;
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

export default function PatientActualitesTeaser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = usePublications();
  const posts = (data?.publications || []).slice(0, 2);

  return (
    <Wrap>
      <Header>
        <h2><Newspaper size={18} /> {t('patientHome.news_title')}</h2>
        <ViewAll type="button" onClick={() => navigate('/actualites')}>
          {t('patientHome.news_view_all')} <ChevronRight size={14} />
        </ViewAll>
      </Header>

      {isLoading && <Spinner size={20} text={t('actualites.loading')} />}

      {!isLoading && posts.length === 0 && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
          {t('patientHome.news_empty')}
        </p>
      )}

      {posts.map((post) => (
        <Post key={post.id} type="button" onClick={() => navigate('/actualites')}>
          <div className="badge">
            {post.type === 'realisation' ? <><Trophy size={11} /> {t('actualites.type_achievement')}</> : t('actualites.type_news')}
          </div>
          <strong>{post.titre}</strong>
          <span>{post.contenu}</span>
        </Post>
      ))}
    </Wrap>
  );
}
