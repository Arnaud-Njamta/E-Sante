import React from 'react';
import styled from 'styled-components';
import { resolveFileUrl } from './PhotoUploadCard';
import { getInitials } from '../../utils/helpers';
import { getDisplayName } from '../../config/branding';

const Circle = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $round }) => ($round ? '50%' : '12px')};
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $url, theme }) => (
    $url ? 'transparent' : `linear-gradient(135deg, ${theme.colors.primary[400]}, ${theme.colors.primary[600]})`
  )};
  background-image: ${({ $url }) => ($url ? `url(${$url})` : 'none')};
  background-size: cover;
  background-position: center;
  color: #fff;
  font-size: ${({ $size }) => Math.max(0.65, $size * 0.34)}px;
  font-weight: 700;
  border: 2px solid ${({ theme, $borderless }) => ($borderless ? 'transparent' : theme.colors.border)};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`;

export default function UserAvatar({
  user,
  role,
  size = 40,
  round = true,
  borderless = false,
  onClick,
  className,
  photoVersion,
}) {
  const photoUrl = resolveFileUrl(user?.photo_url, user?.fichier_photo_id);
  const bust = photoVersion ?? user?.updatedAt ?? user?.fichier_photo_id;
  const urlWithBust = photoUrl && bust ? `${photoUrl}${photoUrl.includes('?') ? '&' : '?'}v=${bust}` : photoUrl;

  let fallback = '?';
  if (user) {
    if (['pharmacie', 'hopital', 'clinique'].includes(role)) {
      fallback = (user.nom?.[0] || 'P').toUpperCase();
    } else if (role === 'admin') {
      fallback = (user.nom?.[0] || 'A').toUpperCase();
    } else {
      fallback = getInitials(getDisplayName(user, role) || user.prenom || 'U');
    }
  }

  return (
    <Circle
      $size={size}
      $round={round}
      $url={urlWithBust}
      $borderless={borderless}
      $clickable={!!onClick}
      onClick={onClick}
      className={className}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'Mon profil' : undefined}
    >
      {!urlWithBust && fallback}
    </Circle>
  );
}
