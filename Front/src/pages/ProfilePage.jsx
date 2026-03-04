import React, { useState } from 'react';
import styled from 'styled-components';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, CalendarDays, Clock, Save,
  Shield, UserCircle, Bell, Sun, Sunset, Moon,
  Camera, Download, Lock, Link, Info,
} from 'lucide-react';

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

const AvatarCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary[300]}, ${({ theme }) => theme.colors.primary[500]});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  flex-shrink: 0;
  position: relative;
`;

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

/* ─── Component ─── */
export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [toggles, setToggles] = useState({ reminders: true, refill: true, reports: false, twofa: true, sharing: true });
  const { register, handleSubmit } = useForm({
    defaultValues: {
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      dateNaissance: user?.date_naissance || user?.dateNaissance || '',
    },
  });

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await updateProfile({
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
        date_naissance: formData.dateNaissance,
      });
      toast.success('Profil mis à jour avec succès');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => setToggles((p) => ({ ...p, [key]: !p[key] }));
  const initials = `${(user?.prenom || 'P')[0]}${(user?.nom || '')[0] || ''}`.toUpperCase();

  return (
    <>
      <PageHeader>
        <div>
          <h1>Profil & Paramètres</h1>
          <p>Gérez votre compte personnel et vos préférences.</p>
        </div>
        <Button icon={Save} onClick={handleSubmit(onSubmit)} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Info */}
        <PersonalCard delay="0.05s">
          <SectionHead><User /> <h3>Informations personnelles</h3></SectionHead>
          <AvatarRow>
            <AvatarCircle>
              {initials}
              <CameraBtn><Camera /></CameraBtn>
            </AvatarCircle>
            <AvatarInfo>
              <h2>{user?.prenom || 'Patient'} {user?.nom || ''}</h2>
              <p>Mettez à jour votre photo et vos détails personnels.</p>
            </AvatarInfo>
          </AvatarRow>

          <FormGrid>
            <Input label="Prénom" icon={User} {...register('prenom')} />
            <Input label="Nom" icon={User} {...register('nom')} />
            <Input label="Adresse e-mail" type="email" icon={Mail} {...register('email')} disabled />
            <Input label="Numéro de téléphone" type="tel" icon={Phone} {...register('telephone')} />
            <Input label="Date de naissance" type="date" icon={CalendarDays} {...register('dateNaissance')} />
          </FormGrid>
        </PersonalCard>

        {/* Notifications + Time Windows */}
        <MiddleGrid>
          <Card delay="0.1s" style={{ padding: '1.5rem' }}>
            <SectionHead><Bell /> <h3>Notifications</h3></SectionHead>
            <ToggleRow>
              <ToggleInfo>
                <h4>Rappels de médicaments</h4>
                <p>Alertes quotidiennes pour les prises programmées</p>
              </ToggleInfo>
              <Toggle $on={toggles.reminders} onClick={() => toggle('reminders')} />
            </ToggleRow>
            <ToggleRow>
              <ToggleInfo>
                <h4>Alertes de renouvellement</h4>
                <p>Quand vos médicaments arrivent à épuisement</p>
              </ToggleInfo>
              <Toggle $on={toggles.refill} onClick={() => toggle('refill')} />
            </ToggleRow>
            <ToggleRow>
              <ToggleInfo>
                <h4>Rapports hebdomadaires</h4>
                <p>Résumé de votre observance par e-mail</p>
              </ToggleInfo>
              <Toggle $on={toggles.reports} onClick={() => toggle('reports')} />
            </ToggleRow>
          </Card>

          <Card delay="0.15s" style={{ padding: '1.5rem' }}>
            <SectionHead><Clock /> <h3>Fenêtres de prise</h3></SectionHead>
            <WindowItem>
              <WindowIcon $bg="#FEF3C7" $color="#F59E0B"><Sun /></WindowIcon>
              <div>
                <WindowLabel>Matin</WindowLabel>
                <WindowTimes>08h00 <Clock /> — 10h00 <Clock /></WindowTimes>
              </div>
            </WindowItem>
            <WindowItem>
              <WindowIcon $bg="#DBEAFE" $color="#2D7FF9"><Sunset /></WindowIcon>
              <div>
                <WindowLabel>Après-midi</WindowLabel>
                <WindowTimes>12h00 <Clock /> — 14h00 <Clock /></WindowTimes>
              </div>
            </WindowItem>
            <WindowItem>
              <WindowIcon $bg="#EDE9FE" $color="#7C3AED"><Moon /></WindowIcon>
              <div>
                <WindowLabel>Soir</WindowLabel>
                <WindowTimes>19h00 <Clock /> — 21h00 <Clock /></WindowTimes>
              </div>
            </WindowItem>
          </Card>
        </MiddleGrid>

        {/* Security */}
        <SecurityCard delay="0.2s">
          <SectionHead><Shield /> <h3>Sécurité</h3></SectionHead>
          <SecurityGrid>
            <div>
              <ToggleRow>
                <ToggleInfo>
                  <h4>Authentification 2 facteurs</h4>
                  <p>Sécurisez votre compte avec un code par SMS</p>
                </ToggleInfo>
                <Toggle $on={toggles.twofa} onClick={() => toggle('twofa')} />
              </ToggleRow>
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 8px' }}>Gestion du mot de passe</h4>
                <Button variant="outline" size="sm" icon={Lock} type="button">
                  Changer le mot de passe
                </Button>
              </div>
            </div>
            <RecommendBox>
              <Info />
              <div>
                <h4>Recommandation sécurité</h4>
                <p>Nous suggérons de changer votre mot de passe régulièrement. Utilisez une combinaison de lettres, chiffres et symboles.</p>
              </div>
            </RecommendBox>
          </SecurityGrid>
        </SecurityCard>

        {/* GDPR */}
        <GDPRCard>
          <GDPRContent>
            <GDPRText>
              <h3><Shield /> Confidentialité & RGPD</h3>
              <p>Vous avez le droit d'accéder et de contrôler vos données de santé. E-Santé est conforme au RGPD pour garantir que vos informations personnelles de santé sont traitées de manière sécurisée et transparente.</p>
            </GDPRText>
            <Button
              variant="secondary"
              icon={Download}
              type="button"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Télécharger mes données
            </Button>
          </GDPRContent>

          <GDPRConsent>
            <Toggle $on={toggles.sharing} onClick={() => toggle('sharing')} />
            <div>
              <strong>Partage de données</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>Autoriser le partage de données anonymisées pour la recherche médicale.</p>
            </div>
          </GDPRConsent>
          <GDPRLink href="#">Lire notre Politique de Confidentialité et nos Conditions d'Utilisation</GDPRLink>
        </GDPRCard>

        <SaveBar>
          <Button variant="outline" type="button">Annuler</Button>
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </Button>
        </SaveBar>
      </form>
    </>
  );
}
