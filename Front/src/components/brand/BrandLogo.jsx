import React from 'react';
import styled from 'styled-components';
import { BRAND } from '../../config/branding';

export const LOGO_FULL = '/images/logo-djamsante.jpg';
export const LOGO_EMBLEM = '/images/logo-emblem.png';

const FullLogo = styled.img`
  display: block;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth || '320px'};
  height: auto;
  object-fit: contain;
`;

const CompactWrap = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  min-width: 0;
`;

const Emblem = styled.img`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: ${({ $round }) => ($round ? '12px' : '0')};
`;

const CompactText = styled.div`
  min-width: 0;

  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-size: ${({ $size }) => ($size === 'sm' ? '1rem' : '1.125rem')};
    font-weight: 600;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.1;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 0.68rem;
    color: ${({ theme }) => theme.colors.textMuted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/**
 * @param {'full'|'compact'|'emblem'} variant
 * @param {string} [tagline] — sous-titre compact
 * @param {number} [emblemSize]
 */
export default function BrandLogo({
  variant = 'full',
  tagline,
  emblemSize = 40,
  maxWidth,
  roundEmblem = true,
  alt = BRAND.name,
}) {
  if (variant === 'emblem') {
    return (
      <Emblem
        src={LOGO_EMBLEM}
        alt={alt}
        $size={emblemSize}
        $round={roundEmblem}
        onError={(e) => { e.currentTarget.src = LOGO_FULL; }}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <CompactWrap>
        <Emblem
          src={LOGO_EMBLEM}
          alt=""
          $size={emblemSize}
          $round={roundEmblem}
          onError={(e) => { e.currentTarget.src = LOGO_FULL; }}
        />
        <CompactText $size={emblemSize <= 36 ? 'sm' : 'md'}>
          <h1>{BRAND.name}</h1>
          {tagline && <span>{tagline}</span>}
        </CompactText>
      </CompactWrap>
    );
  }

  return <FullLogo src={LOGO_FULL} alt={alt} $maxWidth={maxWidth} />;
}
