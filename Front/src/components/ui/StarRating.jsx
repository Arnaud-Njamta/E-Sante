import React from 'react';
import styled from 'styled-components';
import { Star } from 'lucide-react';

const StarsWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const StarIcon = styled(Star)`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  color: ${({ $filled, theme }) => ($filled ? '#F59E0B' : theme.colors.border)};
  fill: ${({ $filled }) => ($filled ? '#F59E0B' : 'none')};
`;

const Count = styled.span`
  margin-left: 6px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export default function StarRating({ rating = 5, count = 0, size = 16, showCount = true }) {
  const value = Math.min(5, Math.max(0, Number(rating) || 5));

  return (
    <StarsWrap>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          $size={size}
          $filled={star <= Math.round(value)}
        />
      ))}
      {showCount && (
        <Count>
          {Number(value).toFixed(1)}
          {count > 0 ? ` (${count})` : ''}
        </Count>
      )}
    </StarsWrap>
  );
}
