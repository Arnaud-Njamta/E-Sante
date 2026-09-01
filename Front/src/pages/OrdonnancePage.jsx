import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { useOrdonnances, useScanOrdonnance, useValiderOrdonnance } from '../hooks/useOrdonnances';
import toast from 'react-hot-toast';
import {
  UploadCloud, Image, FileText, Trash2, Eye, ScanLine,
  FolderOpen, Pill, CalendarDays, CheckCircle, Camera, AlertTriangle,
} from 'lucide-react';
import CameraCapture from '../components/ui/CameraCapture';
import { Link } from 'react-router-dom';
import { getActiveLocale } from '../i18n/syncLanguage';

/* ─── Styles ─── */
const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  animation: fadeIn 0.4s ease both;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TitleIcon = styled.span`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  svg { width: 20px; height: 20px; }
`;

const TitleText = styled.div`
  h1 { font-size: ${({ theme }) => theme.typography.sizes['2xl']}; font-weight: ${({ theme }) => theme.typography.weights.bold}; color: ${({ theme }) => theme.colors.text}; margin: 0 0 2px; }
  p { font-size: ${({ theme }) => theme.typography.sizes.sm}; color: ${({ theme }) => theme.colors.textSecondary}; margin: 0; }
`;

const UploadZone = styled.div`
  border: 2px dashed ${({ theme, $dragging }) => $dragging ? theme.colors.primary[400] : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing[10]};
  text-align: center;
  background: ${({ theme, $dragging }) => $dragging ? theme.colors.primary[50] : theme.colors.neutral[50]};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  animation: fadeInUp 0.4s ease both;
  animation-delay: 0.1s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[400]};
    background: ${({ theme }) => theme.colors.primary[50]};
  }
`;

const UploadIconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[100]}, ${({ theme }) => theme.colors.primary[200]});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.primary[500]};
  svg { width: 28px; height: 28px; }
`;

const UploadTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const UploadDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const Formats = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  h3 { font-size: ${({ theme }) => theme.typography.sizes.md}; font-weight: ${({ theme }) => theme.typography.weights.semibold}; color: ${({ theme }) => theme.colors.text}; margin: 0; }
  svg { width: 20px; height: 20px; color: ${({ theme }) => theme.colors.primary[500]}; }
`;

const OrdoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const OrdoCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  animation-delay: ${({ $delay }) => $delay};
`;

const OrdoIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.warning[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.warning[600]};
  flex-shrink: 0;
  svg { width: 22px; height: 22px; }
`;

const OrdoInfo = styled.div`
  flex: 1;
  min-width: 0;
  h4 { font-size: ${({ theme }) => theme.typography.sizes.sm}; font-weight: ${({ theme }) => theme.typography.weights.semibold}; color: ${({ theme }) => theme.colors.text}; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  p { font-size: ${({ theme }) => theme.typography.sizes.xs}; color: ${({ theme }) => theme.colors.textMuted}; margin: 2px 0 0; display: flex; align-items: center; gap: 4px; }
  p svg { width: 12px; height: 12px; }
`;

const MedsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const OrdoActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;
`;

/* ─── Component ─── */
export default function OrdonnancePage() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const { data: ordonnances, isLoading, error } = useOrdonnances();
  const scanMutation = useScanOrdonnance();
  const validerMutation = useValiderOrdonnance();

  const getStatutInfo = (statut) => {
    switch (statut) {
      case 'validee': case 'traitee': return { label: t('ordonnance.status_validated'), color: 'success' };
      case 'en_cours': case 'en_attente': return { label: t('ordonnance.status_pending'), color: 'warning' };
      case 'rejetee': return { label: t('ordonnance.status_rejected'), color: 'danger' };
      default: return { label: statut || t('ordonnance.status_pending'), color: 'warning' };
    }
  };

  const handleValider = (ordoId) => {
    validerMutation.mutate({ id: ordoId, corrections: [] }, {
      onSuccess: () => toast.success(t('ordonnance.validated_toast')),
      onError: (err) => toast.error(err.response?.data?.message || t('ordonnance.validate_error')),
    });
  };

  const allOrdonnances = Array.isArray(ordonnances) ? ordonnances : [];

  const handleUpload = (filesOrFile) => {
    const file = filesOrFile?.length ? filesOrFile[0] : filesOrFile;
    if (file) {
      scanMutation.mutate(file, {
        onSuccess: (data) => {
          const v = data?.verification_ia?.verdict;
          toast.success(v
            ? t('ordonnance.scan_ia', { verdict: v })
            : t('ordonnance.scan_success'));
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || t('ordonnance.scan_error'));
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  if (isLoading) return <Spinner text={t('ordonnance.loading')} />;
  if (error) return <ErrorState title={t('errors.generic')} message={t('ordonnance.load_error')} onRetry={() => window.location.reload()} />;

  return (
    <>
      <PageHeader>
        <TitleIcon><ScanLine /></TitleIcon>
        <TitleText>
          <h1>{t('ordonnance.title')}</h1>
          <p>{t('ordonnance.subtitle')}</p>
        </TitleText>
      </PageHeader>

      <UploadZone
        $dragging={dragging}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" hidden onChange={(e) => handleUpload(e.target.files)} />
        <UploadIconCircle><UploadCloud /></UploadIconCircle>
        <UploadTitle>{scanMutation.isPending ? t('ordonnance.scanning') : t('ordonnance.drop_title')}</UploadTitle>
        <UploadDesc>{t('ordonnance.drop_desc')}</UploadDesc>
        <Formats>{t('ordonnance.formats')}</Formats>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setShowCamera(true); }}>
            <Camera size={16} /> {t('ordonnance.film')}
          </Button>
        </div>
      </UploadZone>

      {showCamera && (
        <CameraCapture
          onCapture={handleUpload}
          onClose={() => setShowCamera(false)}
        />
      )}

      <SectionTitle>
        <FolderOpen />
        <h3>{t('ordonnance.recent')}</h3>
      </SectionTitle>

      {allOrdonnances.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('ordonnance.empty_title')}
          description={t('ordonnance.empty_desc')}
        />
      ) : (
        <OrdoList>
          {allOrdonnances.map((ordo, index) => {
            const statutInfo = getStatutInfo(ordo.statut);
            const ia = ordo.verification_ia || ordo.donnees_parsees?.verification_ia;
            const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
            const imageUrl = ordo.image_url ? `${apiBase}${ordo.image_url}` : null;
            return (
              <OrdoCard key={ordo.id} hoverable delay={`${0.05 * (index + 1)}s`}>
                <OrdoIcon><Image /></OrdoIcon>
                <OrdoInfo>
                  <h4>{ordo.nom_fichier || ordo.filename || t('ordonnance.default_name', { id: ordo.id })}</h4>
                  <p>
                    <CalendarDays />
                    {t('ordonnance.imported', {
                      date: new Date(ordo.created_at || ordo.date).toLocaleDateString(getActiveLocale(), { day: 'numeric', month: 'long', year: 'numeric' }),
                    })}
                  </p>
                  {ordo.medicaments_extraits && ordo.medicaments_extraits.length > 0 && (
                    <MedsList>
                      {ordo.medicaments_extraits.map((m, i) => (
                        <Badge key={i} color="primary" size="sm">{m.nom || m}</Badge>
                      ))}
                    </MedsList>
                  )}
                  {ia && (
                    <p style={{ fontSize: '0.8rem', marginTop: 8, color: ia.verdict === 'rejete' ? '#DC2626' : '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {ia.verdict === 'rejete' || ia.verdict === 'douteux' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                      {t('ordonnance.ia_check', { verdict: ia.verdict || 'en cours' })} {ia.score_confiance ? `(${ia.score_confiance}%)` : ''}
                    </p>
                  )}
                  {ordo.acceptable_pharmacie && (
                    <p style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: 4 }}>
                      <Link to="/sante">{t('ordonnance.pharmacy_link')}</Link>
                    </p>
                  )}
                </OrdoInfo>
                <Badge color={statutInfo.color} dot>
                  {statutInfo.label}
                </Badge>
                <OrdoActions>
                  {(ordo.statut === 'en_cours' || ordo.statut === 'en_attente' || !ordo.statut) && (
                    <Button
                      size="sm"
                      variant="success"
                      icon={CheckCircle}
                      onClick={() => handleValider(ordo.id)}
                      disabled={validerMutation.isPending}
                    >
                      {t('ordonnance.validate')}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" icon={Eye} onClick={() => imageUrl && window.open(imageUrl, '_blank')} />
                </OrdoActions>
              </OrdoCard>
            );
          })}
        </OrdoList>
      )}
    </>
  );
}
