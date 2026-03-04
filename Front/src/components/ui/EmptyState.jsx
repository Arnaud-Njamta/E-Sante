import React from 'react';
import styled from 'styled-components';
import { Inbox } from 'lucide-react';

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
  background: ${({ theme }) => theme.colors.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  svg {
    width: 28px;
    height: 28px;
    color: ${({ theme }) => theme.colors.textMuted};
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
  max-width: 360px;
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`;

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Aucune donnée',
  description = 'Il n\'y a rien à afficher pour le moment.',
  action,
}) {
  return (
    <Wrapper role="status">
      <IconCircle><Icon /></IconCircle>
      <Title>{title}</Title>
      <Description>{description}</Description>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </Wrapper>
  );
}
