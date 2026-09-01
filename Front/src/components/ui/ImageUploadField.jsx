import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Loader2, Upload } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { resolveFileUrl } from './PhotoUploadCard';
import { prepareImageForUpload, getUploadErrorMessage } from '../../utils/prepareImageUpload';

const PreviewBox = styled.div`
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 140px;
  object-fit: contain;
`;

const HiddenInput = styled.input` display: none; `;

export default function ImageUploadField({
  title,
  subtitle,
  icon: Icon,
  photoUrl,
  fichierId,
  onUpload,
  onError,
  isUploading = false,
  cacheBust,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  const displayUrl = preview || resolveFileUrl(photoUrl, fichierId, cacheBust);
  const busy = isUploading || localLoading;

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setLocalLoading(true);
    let objectUrl;
    try {
      const prepared = await prepareImageForUpload(file);
      objectUrl = URL.createObjectURL(prepared);
      setPreview(objectUrl);
      await onUpload(prepared);
      setPreview(null);
    } catch (err) {
      setPreview(null);
      if (onError) onError(err);
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setLocalLoading(false);
    }
  };

  const handleClick = () => {
    if (!busy) inputRef.current?.click();
  };

  return (
    <Card style={{ padding: 24 }}>
      <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={18} />} {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>{subtitle}</p>
      )}
      <PreviewBox>
        {displayUrl ? (
          <PreviewImg src={displayUrl} alt={title} />
        ) : (
          <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Aucune image</span>
        )}
      </PreviewBox>
      <HiddenInput
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,.jpg,.jpeg,.png,.webp"
        onChange={handleChange}
      />
      <Button type="button" variant="secondary" disabled={busy} onClick={handleClick}>
        {busy ? (
          <><Loader2 size={16} className="spin" /> Envoi en cours...</>
        ) : (
          <><Upload size={16} /> Choisir une image</>
        )}
      </Button>
      <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 10 }}>JPG, PNG, WEBP — max 10 Mo</p>
    </Card>
  );
}

export { getUploadErrorMessage };
