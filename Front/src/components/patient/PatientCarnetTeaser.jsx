import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookHeart, ChevronRight, Droplets, AlertTriangle } from 'lucide-react';
import { useCarnetMedical } from '../../hooks/useCarnetMedical';

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 8px 24px rgba(219, 39, 119, 0.2); }
  50% { box-shadow: 0 12px 32px rgba(219, 39, 119, 0.35); }
`;

const Wrap = styled.div`
  display: ${({ $alwaysVisible }) => ($alwaysVisible ? 'block' : 'none')};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  animation: ${slideIn} 0.6s cubic-bezier(0.32, 0.72, 0, 1) both;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const CardBtn = styled.button`
  width: 100%;
  text-align: left;
  border: none;
  cursor: pointer;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.15s ease;

  &:active { transform: scale(0.98); }

  ${({ $active }) => ($active ? css`
    background: linear-gradient(135deg, #FDF2F8, #FCE7F3);
    border: 1px solid #F9A8D4;
    animation: ${pulse} 2.5s ease-in-out infinite;
  ` : css`
    background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
    border: 1px solid #6EE7B7;
  `)}
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $active }) => ($active ? '#DB2777' : '#047857')};
  color: white;

  svg { width: 24px; height: 24px; }
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;

  h3 {
    margin: 0 0 4px;
    font-size: 0.95rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0;
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.7);
    color: #047857;
  }
`;

const Arrow = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  svg { width: 20px; height: 20px; }
`;

export default function PatientCarnetTeaser({ alwaysVisible = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useCarnetMedical();

  if (isLoading) return null;

  const isActive = !!data?.actif;
  const allergyCount = data?.allergies?.length || 0;

  if (!isActive) {
    return (
      <Wrap $alwaysVisible={alwaysVisible}>
        <CardBtn type="button" $active onClick={() => navigate('/carnet-medical')}>
          <IconBox $active><BookHeart /></IconBox>
          <Body>
            <h3>{t('carnetTeaser.create_title')}</h3>
            <p>{t('carnetTeaser.create_desc')}</p>
          </Body>
          <Arrow><ChevronRight /></Arrow>
        </CardBtn>
      </Wrap>
    );
  }

  return (
    <Wrap $alwaysVisible={alwaysVisible}>
      <CardBtn type="button" onClick={() => navigate('/carnet-medical')}>
        <IconBox><BookHeart /></IconBox>
        <Body>
          <h3>{t('carnetTeaser.active_title')}</h3>
          <p>{t('carnetTeaser.active_desc')}</p>
          <Meta>
            {data.groupe_sanguin && (
              <span><Droplets size={12} /> {data.groupe_sanguin}</span>
            )}
            {allergyCount > 0 && (
              <span>
                <AlertTriangle size={12} />
                {' '}
                {t(allergyCount > 1 ? 'carnetTeaser.allergy_other' : 'carnetTeaser.allergy_one', { count: allergyCount })}
              </span>
            )}
          </Meta>
        </Body>
        <Arrow><ChevronRight /></Arrow>
      </CardBtn>
    </Wrap>
  );
}
