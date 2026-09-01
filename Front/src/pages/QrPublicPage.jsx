import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Droplets, AlertTriangle, Phone, Shield } from 'lucide-react';
import { useQrPublic } from '../hooks/useQrMedical';
import Spinner from '../components/ui/Spinner';

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #065F46, #047857);
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 28px 24px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);

  h1 {
    margin: 0 0 4px;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #065F46;
  }

  .source {
    font-size: 0.72rem;
    color: #94A3B8;
    margin-bottom: 20px;
  }
`;

const Row = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #F1F5F9;
  font-size: 0.9rem;

  strong {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94A3B8;
    margin-bottom: 4px;
  }

  &.alert strong { color: #DC2626; }
`;

const ErrorCard = styled(Card)`
  text-align: center;
  color: #991B1B;
`;

export default function QrPublicPage() {
  const { token } = useParams();
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQrPublic(token);

  if (isLoading) {
    return (
      <Page><Spinner text={t('common.loading')} /></Page>
    );
  }

  if (isError || !data) {
    return (
      <Page>
        <ErrorCard>
          <Shield size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h1>{t('qr.not_found')}</h1>
        </ErrorCard>
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        <h1><Heart size={22} color="#DC2626" /> {t('qr.public_title')}</h1>
        <div className="source">{data.source}</div>

        <Row>
          <strong>Patient</strong>
          {data.prenom} {data.nom}
          {data.relation && ` (${data.relation})`}
        </Row>

        {data.groupe_sanguin && (
          <Row>
            <strong><Droplets size={12} style={{ display: 'inline' }} /> {t('qr.blood')}</strong>
            {data.groupe_sanguin}
          </Row>
        )}

        {data.allergies?.length > 0 && (
          <Row className="alert">
            <strong><AlertTriangle size={12} style={{ display: 'inline' }} /> {t('qr.allergies')}</strong>
            {data.allergies.join(' · ')}
          </Row>
        )}

        {data.pathologies?.length > 0 && (
          <Row>
            <strong>Pathologies</strong>
            {data.pathologies.join(' · ')}
          </Row>
        )}

        {data.contact_urgence && (
          <Row>
            <strong><Phone size={12} style={{ display: 'inline' }} /> {t('qr.contact')}</strong>
            <a href={`tel:${data.contact_urgence}`}>{data.contact_urgence}</a>
          </Row>
        )}

        {data.date_naissance && (
          <Row>
            <strong>Naissance</strong>
            {new Date(data.date_naissance).toLocaleDateString()}
          </Row>
        )}
      </Card>
    </Page>
  );
}
