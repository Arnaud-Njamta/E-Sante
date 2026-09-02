import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import PublicationDetailView from '../components/publications/PublicationDetailView';
import { usePublication } from '../hooks/usePublications';
import { useAuth } from '../context/AuthContext';

const Page = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 32px;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0 20px;
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

export default function PublicationDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: post, isLoading, isError } = usePublication(id);

  const backLabel = isAuthenticated ? t('actualites.back_feed') : t('actualites.back_login');

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/actualites');
  };

  if (isLoading) return <Spinner text={t('actualites.loading')} />;

  if (isError || !post) {
    return (
      <Page>
        <BackBtn type="button" onClick={goBack}>
          <ArrowLeft size={18} />
          {backLabel}
        </BackBtn>
        <ErrorState
          title={t('actualites.not_found_title')}
          message={t('actualites.not_found_desc')}
        />
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button variant="outline" onClick={() => navigate('/actualites')}>
            {t('actualites.back_feed')}
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <BackBtn type="button" onClick={goBack}>
        <ArrowLeft size={18} />
        {t('actualites.back_feed')}
      </BackBtn>
      <PublicationDetailView post={post} />
    </Page>
  );
}
