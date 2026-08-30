import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Camera, Loader2 } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { authenticatedFileUrl } from '../../utils/fileUrl';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const AvatarWrap = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $round }) => ($round ? '50%' : '16px')};
  background: ${({ $url }) => ($url ? `url(${$url}) center/cover` : 'linear-gradient(135deg,#E2E8F0,#CBD5E1)')};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 3px solid ${({ theme }) => theme.colors.primary[100]};
`;

const HiddenInput = styled.input` display: none; `;

export function resolveFileUrl(url, fichierId) {
  if (fichierId) return authenticatedFileUrl(fichierId, Date.now());
  if (url) {
    const full = url.startsWith('http') ? url : `${API_BASE}${url}`;
    return `${full}${full.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }
  return null;
}

export default function PhotoUploadCard({
  title = 'Photo de profil',
  subtitle,
  photoUrl,
  fichierId,
  onUpload,
  isUploading,
  round = true,
  size = 140,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const displayUrl = preview || resolveFileUrl(photoUrl, fichierId);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    await onUpload(file);
  };

  return (
    <Card style={{ padding: 24, textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Camera size={18} /> {title}
      </h3>
      {subtitle && <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>{subtitle}</p>}
      <AvatarWrap $url={displayUrl} $size={size} $round={round}>
        {!displayUrl && <Camera size={36} color="#94A3B8" />}
      </AvatarWrap>
      <HiddenInput ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleChange} />
      <Button type="button" variant="secondary" disabled={isUploading} onClick={() => inputRef.current?.click()}>
        {isUploading ? <><Loader2 size={16} className="spin" /> Envoi...</> : 'Choisir une photo'}
      </Button>
      <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 10 }}>JPG, PNG, WEBP — max 10 Mo</p>
    </Card>
  );
}
