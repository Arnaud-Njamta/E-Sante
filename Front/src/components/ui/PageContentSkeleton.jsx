import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Wrap = styled.div`
  animation: fadeIn 0.15s ease both;
`;

const Bar = styled.div`
  height: ${({ $h }) => $h || 14}px;
  width: ${({ $w }) => $w || '100%'};
  border-radius: 8px;
  margin-bottom: ${({ $mb }) => $mb || 12}px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const Card = styled.div`
  height: 120px;
  border-radius: 14px;
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
`;

export default function PageContentSkeleton() {
  const { t } = useTranslation();
  return (
    <Wrap aria-busy="true" aria-label={t('common.loading')}>
      <Bar $h={28} $w="45%" $mb={8} />
      <Bar $h={14} $w="60%" $mb={24} />
      <Grid>
        <Card />
        <Card />
        <Card />
      </Grid>
    </Wrap>
  );
}
