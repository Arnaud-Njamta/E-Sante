import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Phone, MapPin, ChevronRight, AlertTriangle, Building2, CheckCircle2, Loader2,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PatientPageHeader from '../components/patient/PatientPageHeader';
import useGeolocation from '../hooks/useGeolocation';
import {
  useUrgenceTypes, useUrgenceProtocole, useUrgenceEtablissements, useCreerDemandePriseEnCharge,
} from '../hooks/useUrgence';
import { EMERGENCY } from '../config/cameroonHealth';
import toast from 'react-hot-toast';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
  50% { box-shadow: 0 0 0 16px rgba(220, 38, 38, 0); }
`;

const HeroBtn = styled.button`
  width: 100%;
  padding: 28px 24px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  color: white;
  font-size: 1.35rem;
  font-weight: 800;
  cursor: pointer;
  animation: ${pulse} 2s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  letter-spacing: 0.02em;

  &:hover { filter: brightness(1.05); }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const TypeCard = styled.button`
  padding: 18px 14px;
  border-radius: 16px;
  border: 2px solid ${({ $active, theme }) => ($active ? '#DC2626' : theme.colors.border)};
  background: ${({ $active }) => ($active ? '#FEF2F2' : '#fff')};
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;

  .emoji { font-size: 2rem; display: block; margin-bottom: 8px; }
  .label { font-size: 0.82rem; font-weight: 600; color: #1E293B; }

  &:hover { border-color: #DC2626; transform: translateY(-2px); }
`;

const CallRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const CallBtn = styled.a`
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 18px;
  border-radius: 14px;
  background: #DC2626;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  &:hover { background: #B91C1C; }
`;

const StepCard = styled(Card)`
  padding: 20px;
  margin-bottom: 14px;
  border-left: 4px solid #DC2626;
`;

const EtabCard = styled(Card)`
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
`;

const CapBadge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 600;
  background: #DCFCE7;
  color: #166534;
  margin: 2px 4px 2px 0;
`;

const STEPS = ['type', 'aide', 'etablissements'];

export default function UrgencePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [msg, setMsg] = useState('');
  const { coords, cityLabel } = useGeolocation({ enabled: true });
  const { data: typesData } = useUrgenceTypes();
  const { data: protocoleData, isLoading: protoLoading } = useUrgenceProtocole(selectedType);
  const { data: etabData, isLoading: etabLoading } = useUrgenceEtablissements(
    {
      type_urgence: selectedType,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      nearby: true,
      radius_km: 50,
      type: 'hopital',
    },
    step === 'etablissements' && !!selectedType,
  );
  const creerDemande = useCreerDemandePriseEnCharge();

  const types = typesData?.types || [];

  const handleSelectType = (id) => {
    setSelectedType(id);
    setStep('aide');
  };

  const handleDemande = async (etab, serviceId = null) => {
    try {
      await creerDemande.mutateAsync({
        etablissement_id: etab.id,
        service_id: serviceId,
        type_urgence: selectedType,
        message_patient: msg || t('urgence.emergency_msg', { label: types.find((typ) => typ.id === selectedType)?.label }),
        priorite: 'urgent',
      });
      toast.success(t('urgence.request_sent', { name: etab.nom }));
    } catch (err) {
      toast.error(err.response?.data?.message || t('urgence.request_error'));
    }
  };

  return (
    <div>
      <PatientPageHeader
        title={t('urgence.title')}
        subtitle={t('urgence.subtitle')}
      />

      {step === 'type' && (
        <>
          <HeroBtn type="button" onClick={() => document.getElementById('types-grid')?.scrollIntoView({ behavior: 'smooth' })}>
            🚨 {t('urgence.help')}
          </HeroBtn>

          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: 16 }}>
            {t('urgence.select_hint', { city: cityLabel ? t('urgence.near_city', { city: cityLabel }) : '' })}
          </p>

          <div id="types-grid">
            <TypeGrid>
              {types.map((t) => (
                <TypeCard key={t.id} $active={selectedType === t.id} type="button" onClick={() => handleSelectType(t.id)}>
                  <span className="emoji">{t.emoji}</span>
                  <span className="label">{t.label}</span>
                </TypeCard>
              ))}
            </TypeGrid>
          </div>

          <CallRow>
            <CallBtn href={`tel:${EMERGENCY.national.number}`}>
              <Phone size={18} /> {EMERGENCY.national.number}
            </CallBtn>
            <CallBtn href={`tel:${EMERGENCY.medical.number}`}>
              <Phone size={18} /> {EMERGENCY.medical.number}
            </CallBtn>
          </CallRow>
        </>
      )}

      {step === 'aide' && (
        <>
          <Button variant="secondary" size="sm" onClick={() => setStep('type')} style={{ marginBottom: 16 }}>
            {t('urgence.change_situation')}
          </Button>

          <CallRow>
            <CallBtn href={`tel:${protocoleData?.protocole?.urgence?.replace(/\D/g, '') || EMERGENCY.medical.number}`}>
              <Phone size={18} /> {t('urgence.call_number', { number: protocoleData?.protocole?.urgence || '1515' })}
            </CallBtn>
          </CallRow>

          {protoLoading ? <Spinner /> : protocoleData?.protocole?.etapes?.map((e) => (
            <StepCard key={e.numero}>
              <strong style={{ color: '#DC2626' }}>{t('urgence.step', { num: e.numero, title: e.titre })}</strong>
              <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{e.detail}</p>
            </StepCard>
          ))}

          {protocoleData?.video && (
            <Card style={{ padding: 16, marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>📹 {protocoleData.video.title}</p>
              <a href={protocoleData.video.url} target="_blank" rel="noopener noreferrer" style={{ color: '#DC2626', fontSize: '0.85rem' }}>
                {t('urgence.watch_video', { duration: protocoleData.video.duration })}
              </a>
            </Card>
          )}

          <textarea
            placeholder={t('urgence.describe_placeholder')}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 16 }}
          />

          <Button onClick={() => setStep('etablissements')} style={{ width: '100%' }}>
            <MapPin size={16} /> {t('urgence.find_establishment')}
            <ChevronRight size={16} />
          </Button>
        </>
      )}

      {step === 'etablissements' && (
        <>
          <Button variant="secondary" size="sm" onClick={() => setStep('aide')} style={{ marginBottom: 16 }}>
            {t('urgence.back_gestures')}
          </Button>

          <p style={{ fontWeight: 600, marginBottom: 12 }}>
            {t('urgence.establishments_title')}
          </p>

          {etabLoading ? <Spinner /> : (etabData?.etablissements || []).length === 0 ? (
            <Card style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 12px' }} />
              <p dangerouslySetInnerHTML={{ __html: t('urgence.no_establishment') }} />
            </Card>
          ) : (
            (etabData?.etablissements || []).map((e) => (
              <EtabCard key={e.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <strong style={{ fontSize: '1rem' }}><Building2 size={16} style={{ verticalAlign: 'middle' }} /> {e.nom}</strong>
                    <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#64748B' }}>
                      <MapPin size={12} /> {e.ville}{e.distance_km != null ? ` — ${e.distance_km} km` : ''}
                    </p>
                    <div style={{ marginTop: 6 }}>
                      {(e.capacites_disponibles || []).map((c) => (
                        <CapBadge key={c}>{t('urgence.capacity_available', { name: c })}</CapBadge>
                      ))}
                    </div>
                    {(e.services || []).slice(0, 4).map((s) => (
                      <CapBadge key={s.id} style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{s.nom}</CapBadge>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <Button
                    size="sm"
                    onClick={() => handleDemande(e, e.services?.[0]?.id)}
                    disabled={creerDemande.isPending}
                  >
                    {creerDemande.isPending ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />}
                    {t('urgence.request_care')}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/sante/etablissement/${e.id}`)}>
                    {t('urgence.view_profile')}
                  </Button>
                  {e.telephone && (
                    <Button size="sm" variant="secondary" onClick={() => window.open(`tel:${e.telephone}`)}>
                      <Phone size={14} /> {t('urgence.call_btn')}
                    </Button>
                  )}
                </div>
              </EtabCard>
            ))
          )}
        </>
      )}
    </div>
  );
}
