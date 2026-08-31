import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[12]};
  text-align: center;
  animation: fadeIn 0.4s ease both;
`;

const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.danger[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  svg {
    width: 28px;
    height: 28px;
    color: ${({ theme }) => theme.colors.danger[500]};
  }
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 400px;
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export default function ErrorState({
  title = 'Une erreur est survenue',
  description,
  message,
  onRetry,
}) {
  const text = description || message || 'Impossible de charger les données. Veuillez réessayer.';
  return (
    <Wrapper role="alert">
      <IconCircle><AlertTriangle /></IconCircle>
      <Title>{title}</Title>
      <Description>{text}</Description>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </Wrapper>
  );
}
