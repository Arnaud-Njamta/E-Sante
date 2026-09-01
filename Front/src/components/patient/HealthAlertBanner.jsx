import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useAlertesSanitaires } from '../../hooks/useAlertesSanitaires';

const PRIORITY_STYLES = {
  critique: { bg: '#FEE2E2', border: '#FECACA', color: '#991B1B' },
  attention: { bg: '#FEF3C7', border: '#FDE68A', color: '#92400E' },
  info: { bg: '#DBEAFE', border: '#BFDBFE', color: '#1E40AF' },
};

const Banner = styled.div`
  padding: 14px 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid ${({ $s }) => $s.border};
  background: ${({ $s }) => $s.bg};
  color: ${({ $s }) => $s.color};
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: filter 0.15s;

  &:hover { filter: brightness(0.98); }

  .content { flex: 1; min-width: 0; }
  strong { display: block; font-size: 0.85rem; margin-bottom: 4px; }
  p { margin: 0; font-size: 0.78rem; line-height: 1.4; opacity: 0.9; }
`;

export default function HealthAlertBanner({ region }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: alertes } = useAlertesSanitaires(region);

  const list = Array.isArray(alertes) ? alertes : [];
  if (!list.length) return null;

  const top = list[0];
  const style = PRIORITY_STYLES[top.priorite] || PRIORITY_STYLES.info;

  return (
    <Banner $s={style} onClick={() => navigate('/actualites?type=alerte_sanitaire')}>
      <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
      <div className="content">
        <strong>
          {t('alertes.title')}
          {top.priorite && ` — ${t(`alertes.priorite.${top.priorite}`, top.priorite)}`}
        </strong>
        <p>{top.titre}</p>
      </div>
      <ChevronRight size={18} style={{ flexShrink: 0, opacity: 0.6 }} />
    </Banner>
  );
}
