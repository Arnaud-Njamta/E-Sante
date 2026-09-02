import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import {
  User, Mail, Phone, CalendarDays, Clock, Save,
  Shield, Bell, Sun, Sunset, Moon,
  Camera, Download, Lock, Info, Trash2, MapPin,
} from 'lucide-react';
import { CAMEROON_REGIONS, VILLES_PAR_REGION } from '../config/cameroonRegions';
import { PATIENT_SIMPLIFIED_MODE } from '../config/patientSimplified';
import PatientMobileProfileHero from '../components/patient/PatientMobileProfileHero';
import UserAvatar from '../components/ui/UserAvatar';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import { PushNotificationToggle } from '../components/patient/PushNotificationPrompt';
import { useUploadPatientPhoto } from '../hooks/usePatientProfile';

/* ─── Styles ─── */
const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  animation: fadeIn 0.4s ease both;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  h1 { font-size: 1.75rem; font-weight: 700; color: ${({ theme }) => theme.colors.text}; margin: 0; }
  p  { font-size: 0.85rem; color: ${({ theme }) => theme.colors.textSecondary}; margin: 4px 0 0; }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const MobilePageHeader = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    animation: fadeIn 0.4s ease both;

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text};
      margin: 0;
    }

    p {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 4px 0 0;
    }
  }
`;

/* Personal Info Section */
const PersonalCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  h3 { margin: 0; font-weight: 700; font-size: 1rem; color: ${({ theme }) => theme.colors.text}; }
  svg { width: 18px; height: 18px; color: ${({ theme }) => theme.colors.primary[500]}; }
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const HiddenPhotoInput = styled.input` display: none; `;

const CameraBtn = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  svg { width: 14px; height: 14px; }
  &:hover { color: ${({ theme }) => theme.colors.primary[500]}; }
`;

const AvatarInfo = styled.div`
  h2 { margin: 0; font-weight: 700; font-size: 1.25rem; color: ${({ theme }) => theme.colors.text}; }
  p  { margin: 2px 0 6px; font-size: 0.85rem; color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[3]};
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 6px;
`;

const FieldSelect = styled.select`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.9rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
`;

const FieldWrap = styled.div``;

/* Middle Grid: Notifications + Time Windows */
const MiddleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[5]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

/* Toggles */
const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]} 0;
  & + & { border-top: 1px solid ${({ theme }) => theme.colors.neutral[100]}; }
`;

const ToggleInfo = styled.div`
  h4 { margin: 0; font-weight: 600; font-size: 0.9rem; color: ${({ theme }) => theme.colors.text}; }
  p  { margin: 2px 0 0; font-size: 0.8rem; color: ${({ theme }) => theme.colors.textMuted}; }
`;

const Toggle = styled.button`
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background: ${({ $on, theme }) => $on ? theme.colors.primary[500] : theme.colors.neutral[200]};
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $on }) => $on ? '24px' : '3px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    transition: all 0.2s;
  }
`;

/* Time Windows */
const WindowItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} 0;
  & + & { border-top: 1px solid ${({ theme }) => theme.colors.neutral[100]}; }
`;

const WindowIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
  svg { width: 18px; height: 18px; }
`;

const WindowLabel = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.primary[500]};
  display: block;
  margin-bottom: 2px;
`;

const WindowTimes = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  svg { width: 14px; height: 14px; color: ${({ theme }) => theme.colors.textMuted}; }
`;

/* Security */
const SecurityCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[5]};
`;

const SecurityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[5]};
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const RecommendBox = styled.div`
  background: ${({ theme }) => theme.colors.primary[50]};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  gap: 10px;
  svg { width: 20px; height: 20px; color: ${({ theme }) => theme.colors.primary[500]}; flex-shrink: 0; margin-top: 2px; }
  h4 { margin: 0 0 4px; font-weight: 700; font-size: 0.85rem; color: ${({ theme }) => theme.colors.primary[600]}; }
  p { margin: 0; font-size: 0.8rem; color: ${({ theme }) => theme.colors.textSecondary}; line-height: 1.5; }
`;

/* GDPR */
const GDPRCard = styled.div`
  background: ${({ theme }) => theme.colors.neutral[800]};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing[6]};
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  animation: fadeIn 0.4s ease both;
  animation-delay: 0.3s;
`;

const GDPRContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[5]};
  flex-wrap: wrap;
`;

const GDPRText = styled.div`
  flex: 1;
  min-width: 280px;
  h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; margin: 0 0 8px; }
  h3 svg { width: 20px; height: 20px; }
  p { font-size: 0.8rem; opacity: 0.8; line-height: 1.6; margin: 0; }
`;

const GDPRConsent = styled.div`
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
`;

const GDPRLink = styled.a`
  color: ${({ theme }) => theme.colors.primary[300]};
  font-size: 0.8rem;
  text-decoration: underline;
  margin-top: 8px;
  display: inline-block;
`;

/* Save Bar */
const SaveBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: ${({ theme }) => theme.spacing[4]};
`;

const Modal = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 100;
  display: flex; align-items: center; justify-content: center; padding: 20px;
`;
const ModalCard = styled(Card)`
  width: 100%; max-width: 420px; padding: 24px;
  h3 { margin: 0 0 16px; font-size: 1.1rem; }
`;

/* ─── Component ─── */
export default function ProfilePage() {
  const { user, role, updateProfile, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const uploadPhoto = useUploadPatientPhoto();
  const photoInputRef = React.useRef(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [deleteForm, setDeleteForm] = useState({ password: '', confirmation: '' });
  const [toggles, setToggles] = useState({
    reminders: true, refill: true, reports: false,
    sharing: !!user?.consentement_recherche,
  });
  const [region, setRegion] = useState(user?.region || '');
  const [ville, setVille] = useState(user?.ville || '');
  const { register, handleSubmit } = useForm({
    defaultValues: {
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      dateNaissance: user?.date_naissance || user?.dateNaissance || '',
    },
  });

  useEffect(() => {
    if (user?.consentement_recherche !== undefined) {
      setToggles((p) => ({ ...p, sharing: !!user.consentement_recherche }));
    }
  }, [user?.consentement_recherche]);

  useEffect(() => {
    setRegion(user?.region || '');
    setVille(user?.ville || '');
  }, [user?.region, user?.ville]);

  const villesOptions = region ? (VILLES_PAR_REGION[region] || []) : [];

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await updateProfile({
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        date_naissance: formData.dateNaissance,
        region: region || null,
        ville: ville || null,
        langue: i18n.language?.split('-')[0] || 'fr',
      });
      toast.success(t('toasts.profile_saved'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.update'));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (key) => {
    if (key === 'sharing') {
      const next = !toggles.sharing;
      setToggles((p) => ({ ...p, sharing: next }));
      try {
        await updateProfile({ consentement_recherche: next });
        toast.success(next ? t('toasts.consent_on') : t('toasts.consent_off'));
      } catch (err) {
        setToggles((p) => ({ ...p, sharing: !next }));
        toast.error(err.response?.data?.message || t('errors.generic'));
      }
      return;
    }
    setToggles((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleExport = async () => {
    try {
      const { data } = await client.get(ENDPOINTS.patients.export);
      const blob = new Blob([JSON.stringify(data.data || data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medisante-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('toasts.export_done'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.export'));
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) {
      toast.error(t('errors.password_mismatch'));
      return;
    }
    try {
      await client.post(ENDPOINTS.auth.changePassword, {
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      toast.success(t('toasts.password_changed'));
      setShowPasswordModal(false);
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.generic'));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await client.delete(ENDPOINTS.patients.account, {
        data: { password: deleteForm.password, confirmation: deleteForm.confirmation },
      });
      toast.success(t('toasts.account_deleted'));
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.delete_account'));
    }
  };

  const handlePhotoPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      await uploadPhoto.mutateAsync(file);
      setPhotoVersion(Date.now());
      toast.success(t('toasts.photo_updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.photo_upload'));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <>
      {role === 'patient' && PATIENT_SIMPLIFIED_MODE ? (
        <MobilePageHeader>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </MobilePageHeader>
      ) : (
        <PatientMobileProfileHero />
      )}

      <PageHeader>
        <div>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitcher />
          <PushNotificationToggle />
          <Button icon={Save} onClick={handleSubmit(onSubmit)} disabled={saving}>
          {saving ? t('profile.saving') : t('profile.save')}
          </Button>
        </div>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <PersonalCard delay="0.05s">
          <SectionHead><User /> <h3>{t('profile.personal_info')}</h3></SectionHead>
          <AvatarRow>
            <AvatarWrap>
              <UserAvatar user={user} role={role} size={80} photoVersion={photoVersion} />
              <CameraBtn type="button" onClick={() => photoInputRef.current?.click()} disabled={uploadPhoto.isPending}>
                <Camera />
              </CameraBtn>
              <HiddenPhotoInput
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handlePhotoPick}
              />
            </AvatarWrap>
            <AvatarInfo>
              <h2>{user?.prenom || t('common.patient')} {user?.nom || ''}</h2>
              <p>{uploadPhoto.isPending ? t('profile.photo_uploading') : t('profile.photo_hint')}</p>
            </AvatarInfo>
          </AvatarRow>

          <FormGrid>
            <Input label={t('profile.firstname')} icon={User} {...register('prenom')} />
            <Input label={t('profile.lastname')} icon={User} {...register('nom')} />
            <Input label={t('profile.email')} type="email" icon={Mail} {...register('email')} disabled />
            <Input label={t('profile.phone')} type="tel" icon={Phone} {...register('telephone')} />
            <Input label={t('profile.birthdate')} type="date" icon={CalendarDays} {...register('dateNaissance')} />
          </FormGrid>
        </PersonalCard>

        <PersonalCard delay="0.08s">
          <SectionHead><MapPin /> <h3>{t('profile.localisation')}</h3></SectionHead>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px' }}>
            {t('profile.localisation_hint')}
          </p>
          <FormGrid>
            <FieldWrap>
              <FieldLabel>{t('profile.region')}</FieldLabel>
              <FieldSelect
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setVille('');
                }}
              >
                <option value="">—</option>
                {CAMEROON_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </FieldSelect>
            </FieldWrap>
            <FieldWrap>
              <FieldLabel>{t('profile.ville')}</FieldLabel>
              <FieldSelect
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                disabled={!region}
              >
                <option value="">—</option>
                {villesOptions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </FieldSelect>
            </FieldWrap>
          </FormGrid>
        </PersonalCard>

        {/* Notifications + Time Windows */}
        <MiddleGrid>
          <Card delay="0.1s" style={{ padding: '1.5rem' }}>
            <SectionHead><Bell /> <h3>{t('profile.notifications')}</h3></SectionHead>
            <ToggleRow>
              <ToggleInfo>
                <h4>{t('profile.reminders_title')}</h4>
                <p>{t('profile.reminders_desc')}</p>
              </ToggleInfo>
              <Toggle $on={toggles.reminders} onClick={() => toggle('reminders')} />
            </ToggleRow>
            <ToggleRow>
              <ToggleInfo>
                <h4>{t('profile.refill_title')}</h4>
                <p>{t('profile.refill_desc')}</p>
              </ToggleInfo>
              <Toggle $on={toggles.refill} onClick={() => toggle('refill')} />
            </ToggleRow>
            <ToggleRow>
              <ToggleInfo>
                <h4>{t('profile.reports_title')}</h4>
                <p>{t('profile.reports_desc')}</p>
              </ToggleInfo>
              <Toggle $on={toggles.reports} onClick={() => toggle('reports')} />
            </ToggleRow>
          </Card>

          <Card delay="0.15s" style={{ padding: '1.5rem' }}>
            <SectionHead><Clock /> <h3>{t('profile.time_windows')}</h3></SectionHead>
            <WindowItem>
              <WindowIcon $bg="#FEF3C7" $color="#F59E0B"><Sun /></WindowIcon>
              <div>
                <WindowLabel>{t('profile.window_morning')}</WindowLabel>
                <WindowTimes>08h00 <Clock /> — 10h00 <Clock /></WindowTimes>
              </div>
            </WindowItem>
            <WindowItem>
              <WindowIcon $bg="#DBEAFE" $color="#2D7FF9"><Sunset /></WindowIcon>
              <div>
                <WindowLabel>{t('profile.window_afternoon')}</WindowLabel>
                <WindowTimes>12h00 <Clock /> — 14h00 <Clock /></WindowTimes>
              </div>
            </WindowItem>
            <WindowItem>
              <WindowIcon $bg="#EDE9FE" $color="#7C3AED"><Moon /></WindowIcon>
              <div>
                <WindowLabel>{t('profile.window_evening')}</WindowLabel>
                <WindowTimes>19h00 <Clock /> — 21h00 <Clock /></WindowTimes>
              </div>
            </WindowItem>
          </Card>
        </MiddleGrid>

        {/* Security */}
        <SecurityCard delay="0.2s">
          <SectionHead><Shield /> <h3>{t('profile.security')}</h3></SectionHead>
          <SecurityGrid>
            <div>
              <div style={{ marginTop: '0.5rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 8px' }}>{t('profile.password_mgmt')}</h4>
                <Button variant="outline" size="sm" icon={Lock} type="button" onClick={() => setShowPasswordModal(true)}>
                  {t('profile.change_password')}
                </Button>
              </div>
            </div>
            <RecommendBox>
              <Info />
              <div>
                <h4>{t('profile.security_tip_title')}</h4>
                <p>{t('profile.security_tip')}</p>
              </div>
            </RecommendBox>
          </SecurityGrid>
        </SecurityCard>

        <GDPRCard>
          <GDPRContent>
            <GDPRText>
              <h3><Shield /> {t('profile.privacy_title')}</h3>
              <p>{t('profile.privacy_desc')}</p>
            </GDPRText>
            <Button
              variant="secondary"
              icon={Download}
              type="button"
              onClick={handleExport}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              {t('profile.download_data')}
            </Button>
          </GDPRContent>

          <GDPRConsent>
            <Toggle $on={toggles.sharing} onClick={() => toggle('sharing')} />
            <div>
              <strong>{t('profile.sharing_title')}</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>{t('profile.sharing_desc')}</p>
            </div>
          </GDPRConsent>
          <GDPRLink as={Link} to="/confidentialite">{t('profile.privacy_policy')}</GDPRLink>
          <div style={{ marginTop: 16 }}>
            <Button variant="outline" size="sm" icon={Trash2} type="button"
              onClick={() => setShowDeleteModal(true)}
              style={{ color: '#FCA5A5', borderColor: 'rgba(252,165,165,0.5)' }}>
              {t('profile.delete_account')}
            </Button>
          </div>
        </GDPRCard>

        {showPasswordModal && (
          <Modal onClick={() => setShowPasswordModal(false)}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
              <h3>{t('profile.modal_change_pw')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label={t('profile.current_password')} type="password" value={pwForm.current}
                  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))} />
                <Input label={t('profile.new_password')} type="password" value={pwForm.next}
                  onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))} />
                <Input label={t('profile.confirm_password')} type="password" value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button variant="outline" type="button" onClick={() => setShowPasswordModal(false)}>{t('common.cancel')}</Button>
                  <Button type="button" onClick={handleChangePassword}>{t('common.save')}</Button>
                </div>
              </div>
            </ModalCard>
          </Modal>
        )}

        {showDeleteModal && (
          <Modal onClick={() => setShowDeleteModal(false)}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
              <h3>{t('profile.modal_delete_title')}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
                {t('profile.modal_delete_desc')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label={t('profile.password')} type="password" value={deleteForm.password}
                  onChange={(e) => setDeleteForm((p) => ({ ...p, password: e.target.value }))} />
                <Input label={t('profile.delete_confirm_label')} value={deleteForm.confirmation}
                  onChange={(e) => setDeleteForm((p) => ({ ...p, confirmation: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button variant="outline" type="button" onClick={() => setShowDeleteModal(false)}>{t('common.cancel')}</Button>
                  <Button type="button" onClick={handleDeleteAccount} style={{ background: '#DC2626' }}>{t('common.delete')}</Button>
                </div>
              </div>
            </ModalCard>
          </Modal>
        )}

        <SaveBar>
          <Button variant="outline" type="button">{t('common.cancel')}</Button>
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? t('profile.saving') : t('profile.save_all')}
          </Button>
        </SaveBar>
      </form>
    </>
  );
}
