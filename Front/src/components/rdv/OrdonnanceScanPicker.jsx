import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Camera, Upload, FileText, X, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import CameraCapture from '../ui/CameraCapture';
import { useScanOrdonnance } from '../../hooks/useOrdonnances';
import { resolveFileUrl } from '../ui/PhotoUploadCard';
import toast from 'react-hot-toast';

const Zone = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1.5px dashed #CBD5E1;
  background: #F8FAFC;
`;

const ZoneTitle = styled.p`
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
`;

const ZoneDesc = styled.p`
  margin: 0 0 12px;
  font-size: 0.82rem;
  color: #64748B;
  line-height: 1.45;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Preview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
`;

const Thumb = styled.img`
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  background: #fff;
`;

const PreviewText = styled.div`
  flex: 1;
  min-width: 0;
  strong { display: block; font-size: 0.88rem; color: #047857; }
  span { font-size: 0.78rem; color: #64748B; }
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 4px;
  &:hover { color: #DC2626; }
`;

export default function OrdonnanceScanPicker({ value, onChange, disabled }) {
  const fileRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const scan = useScanOrdonnance();

  const upload = async (file) => {
    if (!file || disabled) return;
    try {
      const result = await scan.mutateAsync(file);
      onChange(result);
      toast.success('Ordonnance envoyée');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Échec de l\'envoi de l\'ordonnance');
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = '';
  };

  if (value) {
    const thumbUrl = resolveFileUrl(value.image_url);
    return (
      <Preview>
        {thumbUrl ? (
          <Thumb src={thumbUrl} alt="Ordonnance scannée" />
        ) : (
          <FileText size={32} color="#047857" />
        )}
        <PreviewText>
          <strong>Ordonnance jointe</strong>
          <span>Le médecin pourra consulter ce document pour votre demande.</span>
        </PreviewText>
        {!disabled && (
          <RemoveBtn type="button" onClick={() => onChange(null)} aria-label="Retirer l'ordonnance">
            <X size={18} />
          </RemoveBtn>
        )}
      </Preview>
    );
  }

  return (
    <>
      <Zone>
        <ZoneTitle>Ordonnance papier (optionnel)</ZoneTitle>
        <ZoneDesc>
          Si vous avez déjà une ordonnance manuscrite, photographiez-la ou importez-la.
          Sinon, ignorez cette étape : le médecin pourra rédiger l&apos;ordonnance de son côté après la consultation.
        </ZoneDesc>
        <Actions>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || scan.isPending}
            onClick={() => setCameraOpen(true)}
          >
            {scan.isPending ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
            Photographier
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || scan.isPending}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={16} /> Galerie
          </Button>
        </Actions>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileInput}
        />
      </Zone>
      {cameraOpen && (
        <CameraCapture
          onCapture={upload}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </>
  );
}
