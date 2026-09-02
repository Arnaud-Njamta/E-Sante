import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import {
  Bot, X, Send, AlertTriangle, Loader2, Stethoscope,
  Shield, Video, UserRound, Calendar, BookHeart,
} from 'lucide-react';
import { useAiChat, useAiBookRdv, useAiStatus } from '../../hooks/useAiAssistant';
import useGeolocation from '../../hooks/useGeolocation';
import { useAjouterObservationCarnet } from '../../hooks/useCarnetMedical';
import useMediaQuery from '../../hooks/useMediaQuery';
import { useTheme } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import {
  WELCOME_AI_PATIENT, WELCOME_AI_MEDECIN, EMERGENCY, EMERGENCY_FOOTER,
  EMERGENCY_SHORT, CAMEROON_COLORS, SUGGESTIONS_PATIENT, SUGGESTIONS_MEDECIN,
  FEMINICIDE_BANNER,
} from '../../config/cameroonHealth';
import toast from 'react-hot-toast';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(11, 61, 48, 0.35); }
  50% { box-shadow: 0 0 0 10px rgba(11, 61, 48, 0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const FAB = styled.button`
  position: fixed;
  bottom: ${({ $lifted }) => ($lifted
    ? 'calc(96px + env(safe-area-inset-bottom, 0px))'
    : '24px')};
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.deep};
  background: ${({ theme }) => theme.colors.ink};
  color: white;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: transform 0.2s ease, background 0.2s ease;
  animation: ${pulse} 2.8s ease-in-out infinite;

  &:hover {
    transform: scale(1.05);
    background: ${({ theme }) => theme.colors.deep};
  }
`;

const Panel = styled.div`
  position: fixed;
  bottom: ${({ $lifted, $fullscreen }) => {
    if ($fullscreen) return '0';
    return $lifted
      ? 'calc(168px + env(safe-area-inset-bottom, 0px))'
      : '96px';
  }};
  right: ${({ $fullscreen }) => ($fullscreen ? '0' : '24px')};
  left: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  top: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  width: ${({ $fullscreen }) => ($fullscreen ? '100%' : '400px')};
  max-width: ${({ $fullscreen }) => ($fullscreen ? '100%' : 'calc(100vw - 24px)')};
  height: ${({ $fullscreen }) => ($fullscreen ? '100dvh' : '580px')};
  max-height: ${({ $fullscreen }) => ($fullscreen ? '100dvh' : 'calc(100dvh - 110px)')};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme, $fullscreen }) => ($fullscreen ? '0' : theme.radii.lg)};
  border: ${({ theme, $fullscreen }) => ($fullscreen ? 'none' : `1px solid ${theme.colors.border}`)};
  box-shadow: ${({ theme, $fullscreen }) => ($fullscreen ? 'none' : theme.shadows.xl)};
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  padding-top: ${({ $fullscreen }) => ($fullscreen ? 'env(safe-area-inset-top, 0px)' : '0')};
  padding-bottom: ${({ $fullscreen }) => ($fullscreen ? 'env(safe-area-inset-bottom, 0px)' : '0')};
`;

const Header = styled.div`
  padding: 18px 20px;
  background: ${({ theme }) => theme.colors.ink};
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid ${({ theme }) => theme.colors.deep};

  .info { display: flex; align-items: center; gap: 12px; }
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: ${({ theme }) => theme.radii.md};
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  h3 {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-size: 1.05rem;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  p { margin: 3px 0 0; font-size: 0.72rem; opacity: 0.8; }
  button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: ${({ theme }) => theme.radii.editorial};
    color: white;
    cursor: pointer;
    padding: 6px;
    display: flex;
    &:hover { background: rgba(255, 255, 255, 0.18); }
  }
`;

const AwarenessStrip = styled.div`
  padding: 9px 16px;
  background: rgba(206, 17, 38, 0.06);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.68rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.4;

  strong { color: ${CAMEROON_COLORS.redDark}; font-weight: 600; }
`;

const Disclaimer = styled.div`
  padding: 9px 16px;
  background: rgba(11, 61, 48, 0.05);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.68rem;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.45;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  strong { color: ${({ theme }) => theme.colors.deep}; }
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: ${({ theme }) => theme.colors.background};
`;

const MessageRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $user }) => ($user ? 'flex-end' : 'flex-start')};
  gap: 5px;
  max-width: 92%;
  align-self: ${({ $user }) => ($user ? 'flex-end' : 'flex-start')};
`;

const Bubble = styled.div`
  padding: 12px 14px;
  border-radius: ${({ $user, theme }) => ($user
    ? `${theme.radii.lg} ${theme.radii.lg} ${theme.radii.editorial} ${theme.radii.lg}`
    : `${theme.radii.lg} ${theme.radii.lg} ${theme.radii.lg} ${theme.radii.editorial}`)};
  font-size: 0.86rem;
  line-height: 1.55;
  white-space: pre-wrap;
  background: ${({ $user, theme }) => ($user ? theme.colors.ink : theme.colors.surface)};
  color: ${({ $user, theme }) => ($user ? '#fff' : theme.colors.text)};
  border: ${({ $user, theme }) => ($user ? 'none' : `1px solid ${theme.colors.border}`)};

  strong { font-weight: 600; }
`;

const MetaLabel = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const RecCard = styled.div`
  margin-top: 8px;
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 3px solid ${({ theme }) => theme.colors.deep};
  border-radius: ${({ theme }) => theme.radii.md};

  .name {
    font-family: ${({ theme }) => theme.typography.fontFamilySerif};
    font-weight: 500;
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.text};
  }
  .spec { font-size: 0.72rem; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 3px; }
  .motif { font-size: 0.72rem; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 4px; font-style: italic; }
  .slots { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .profile-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.deep};
    margin-top: 10px;
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

const SlotBtn = styled.button`
  padding: 6px 11px;
  border-radius: ${({ theme }) => theme.radii.editorial};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  font-size: 0.68rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.ink};
    color: white;
    border-color: ${({ theme }) => theme.colors.ink};
  }
  &:disabled { opacity: 0.5; cursor: wait; }
`;

const ProtocolCard = styled.div`
  margin-top: 8px;
  padding: 12px 14px;
  background: rgba(206, 17, 38, 0.05);
  border: 1px solid rgba(206, 17, 38, 0.15);
  border-left: 3px solid ${CAMEROON_COLORS.red};
  border-radius: ${({ theme }) => theme.radii.md};

  .title { font-weight: 600; font-size: 0.8rem; color: ${CAMEROON_COLORS.redDark}; margin-bottom: 8px; }
  .step {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 0.72rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.45;
  }
  .num {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${CAMEROON_COLORS.red};
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const VideoCard = styled.a`
  display: block;
  margin-top: 8px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-decoration: none;
  color: inherit;
  background: ${({ theme }) => theme.colors.surface};

  .thumb {
    position: relative;
    padding-top: 56.25%;
    background: ${({ theme }) => theme.colors.ink};
  }
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
  .info { padding: 10px 12px; }
  .title { font-size: 0.76rem; font-weight: 600; color: ${({ theme }) => theme.colors.text}; }
  .source { font-size: 0.65rem; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px; }
`;

const SuggestionChip = styled.button`
  padding: 8px 13px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  font-size: 0.72rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    background: ${({ theme }) => theme.colors.ink};
    color: white;
    border-color: ${({ theme }) => theme.colors.ink};
  }
`;

const InputRow = styled.form`
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  align-items: flex-end;

  input {
    flex: 1;
    padding: 10px 0 8px;
    border: none;
    border-bottom: 1.5px solid ${({ theme }) => theme.colors.border};
    border-radius: 0;
    font-size: 0.86rem;
    font-family: inherit;
    color: ${({ theme }) => theme.colors.text};
    background: transparent;
    outline: none;
    &:focus { border-bottom-color: ${({ theme }) => theme.colors.deep}; }
    &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  }

  button {
    padding: 10px 14px;
    border: none;
    border-radius: ${({ theme }) => theme.radii.editorial};
    background: ${({ theme }) => theme.colors.ink};
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background 0.15s;
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.deep}; }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
  }
`;

const SpinIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const TypingDots = styled.div`
  display: flex; gap: 4px; padding: 4px 0;
  span {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${({ theme }) => theme.colors.deep};
    animation: bounce 1.2s infinite;
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }
`;

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^> (.+)$/gm, '<em>$1</em>');
}

function formatSlotDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

const CarnetBtn = styled.button`
  margin-top: 6px;
  padding: 6px 10px;
  border: 1px dashed #059669;
  border-radius: 8px;
  background: #ECFDF5;
  color: #047857;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  &:hover { background: #D1FAE5; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

function MessageContent({ msg, onBookSlot, bookingKey, isPatient, onSaveToCarnet, savingCarnet }) {
  return (
  <>
    {msg.urgent && (
      <div style={{
        padding: '8px 10px', marginBottom: 6, borderRadius: 8,
        background: '#FEE2E2', color: '#991B1B', fontSize: '0.72rem', fontWeight: 700,
      }}>
        🚨 URGENCE VITALE — Appelez le {EMERGENCY.national.number} ou {EMERGENCY.medical.number}
      </div>
    )}
    <Bubble
      $user={msg.role === 'user'}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
    />
    {msg.accidentProtocol && (
      <ProtocolCard>
        <div className="title">📋 {msg.accidentProtocol.titre}</div>
        {msg.accidentProtocol.etapes?.map((step) => (
          <div key={step.numero} className="step">
            <span className="num">{step.numero}</span>
            <span><strong>{step.titre}</strong> — {step.detail}</span>
          </div>
        ))}
      </ProtocolCard>
    )}
    {isPatient && msg.recommandations?.map((rec) => (
      <RecCard key={rec.id}>
        <div className="name">{rec.nom}</div>
        <div className="spec">
          {rec.specialite}{rec.ville ? ` · ${rec.ville}` : ''}
          {rec.distance_km != null ? ` · ${rec.distance_km < 1 ? `${Math.round(rec.distance_km * 1000)} m` : `${rec.distance_km} km`}` : ''}
          {rec.note ? ` · ★ ${rec.note}` : ''}
        </div>
        <div className="motif">{rec.motif}</div>
        {rec.creneaux?.length > 0 && (
          <div className="slots">
            {rec.creneaux.map((slot) => {
              const key = `${rec.id}-${slot.date}-${slot.heure_debut}`;
              return (
                <SlotBtn
                  key={key}
                  type="button"
                  disabled={bookingKey === key}
                  onClick={() => onBookSlot(rec, slot, key)}
                >
                  {bookingKey === key ? <Loader2 size={11} /> : <Calendar size={11} />}
                  {formatSlotDate(slot.date)} {slot.heure_debut}
                </SlotBtn>
              );
            })}
          </div>
        )}
        <Link className="profile-link" to={`/sante/medecin/${rec.id}`}>
          <Stethoscope size={12} /> Voir le profil complet →
        </Link>
      </RecCard>
    ))}
    {msg.videos?.map((v) => (
      <VideoCard key={v.embedId} href={v.url} target="_blank" rel="noopener noreferrer">
        <div className="thumb">
          <iframe
            src={`https://www.youtube.com/embed/${v.embedId}`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="info">
          <div className="title"><Video size={12} style={{ display: 'inline', marginRight: 4 }} />{v.title}</div>
          <div className="source">{v.source} · {v.duration}</div>
        </div>
      </VideoCard>
    ))}
    {isPatient && msg.role === 'assistant' && msg.content && onSaveToCarnet && (
      <CarnetBtn type="button" onClick={() => onSaveToCarnet(msg.content)} disabled={savingCarnet}>
        <BookHeart size={12} /> {savingCarnet ? 'Enregistrement…' : 'Noter dans mon carnet'}
      </CarnetBtn>
    )}
  </>
  );
}

export default function AiAssistantWidget() {
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const { role } = useAuth();
  const isMedecin = role === 'medecin';
  const isPatient = role === 'patient';
  const liftFab = isPatient && isMobile;
  const welcome = isMedecin ? WELCOME_AI_MEDECIN : WELCOME_AI_PATIENT;
  const suggestions = isMedecin ? SUGGESTIONS_MEDECIN : SUGGESTIONS_PATIENT;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [bookingKey, setBookingKey] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: welcome },
  ]);
  const chat = useAiChat();
  const bookRdv = useAiBookRdv();
  const ajouterObservation = useAjouterObservationCarnet();
  const { data: aiStatus } = useAiStatus(open);
  const { coords, hasLocation } = useGeolocation({ enabled: open && isPatient });
  const bottomRef = useRef(null);

  const handleBookSlot = async (rec, slot, key) => {
    if (!isPatient) {
      toast.error('Connectez-vous en tant que patient pour réserver');
      return;
    }
    setBookingKey(key);
    try {
      await bookRdv.mutateAsync({
        medecin_id: rec.id,
        date_rdv: slot.date,
        heure_debut: slot.heure_debut,
        motif: rec.motif || 'Consultation via assistant IA',
        type_consultation: 'presentiel',
      });
      toast.success(`RDV confirmé avec ${rec.nom} le ${formatSlotDate(slot.date)} à ${slot.heure_debut}`);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `✅ **Rendez-vous réservé** avec ${rec.nom}\n📅 ${formatSlotDate(slot.date)} à **${slot.heure_debut}**\n\nLe médecin confirmera sous peu. Consultez **Mes rendez-vous** dans l'app.`,
      }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de réserver ce créneau');
    } finally {
      setBookingKey(null);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chat.isPending]);

  const send = useCallback(async (text) => {
    const message = (text || input).trim();
    if (!message || chat.isPending) return;

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      .map(({ role, content }) => ({ role, content }));

    const userMsg = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const geo = hasLocation && coords
        ? { latitude: coords.latitude, longitude: coords.longitude }
        : {};
      const data = await chat.mutateAsync({ message, history, ...geo });
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.reply,
        recommandations: data.recommandations,
        videos: data.videos,
        accidentProtocol: data.accidentProtocol,
        accidentMode: data.accidentMode,
        urgent: data.urgent,
      }]);
    } catch (err) {
      const msg = err.response?.data?.message || `Service IA indisponible. En urgence, appelez le ${EMERGENCY_SHORT}.`;
      toast.error(msg);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `⚠️ ${msg}\n\n${EMERGENCY_FOOTER}`,
      }]);
    }
  }, [chat, input, messages, coords, hasLocation]);

  useEffect(() => {
    const handler = (event) => {
      setOpen(true);
      const prompt = event.detail?.message;
      if (prompt) {
        window.setTimeout(() => send(prompt), 50);
      }
    };
    window.addEventListener('djamsante:ai-open', handler);
    return () => window.removeEventListener('djamsante:ai-open', handler);
  }, [send]);

  const showSuggestions = useMemo(
    () => messages.length === 1 && messages[0].role === 'assistant',
    [messages],
  );

  const handleSaveToCarnet = async (content) => {
    const plain = content.replace(/\*\*/g, '').replace(/^> /gm, '').slice(0, 1500);
    try {
      await ajouterObservation.mutateAsync({ text: plain, source: 'ia' });
      toast.success('Observation enregistrée dans votre carnet médical');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d\'enregistrer dans le carnet');
    }
  };

  return (
    <>
      {open && (
        <Panel $lifted={liftFab} $fullscreen={isMobile}>
          <Header>
            <div className="info">
              <div className="avatar"><Bot size={22} /></div>
              <div>
                <h3>Dr. DjamSanté</h3>
                <p>Assistant médical · Cameroun</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer"><X size={18} /></button>
          </Header>

          <AwarenessStrip>
            <Shield size={14} style={{ flexShrink: 0, color: CAMEROON_COLORS.red }} />
            <span>
              <strong>{FEMINICIDE_BANNER.title}</strong> — {FEMINICIDE_BANNER.subtitle}
            </span>
          </AwarenessStrip>

          <Disclaimer>
            <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Premiers secours & orientation. Urgence vitale → <strong>{EMERGENCY.national.number}</strong> ou <strong>{EMERGENCY.medical.number}</strong></span>
          </Disclaimer>

          {aiStatus && !aiStatus.configured && (
            <div style={{
              margin: '0 12px 8px', padding: '10px 12px', borderRadius: 8,
              background: '#FEF3C7', border: '1px solid #FDE68A', fontSize: '0.75rem', color: '#92400E',
            }}
            >
              <strong>IA limitée</strong> — La clé Gemini n&apos;est pas configurée sur le serveur.
              L&apos;assistant fonctionne en mode basique. Contactez l&apos;administrateur pour activer l&apos;IA complète.
            </div>
          )}

          <Messages>
            {messages.map((m, i) => (
              <MessageRow key={i} $user={m.role === 'user'}>
                {m.role !== 'user' && (
                  <MetaLabel><Bot size={11} /> Dr. DjamSanté</MetaLabel>
                )}
                {m.role === 'user' && (
                  <MetaLabel><UserRound size={11} /> Vous</MetaLabel>
                )}
                <MessageContent
                  msg={m}
                  onBookSlot={handleBookSlot}
                  bookingKey={bookingKey}
                  isPatient={isPatient}
                  onSaveToCarnet={i > 0 ? handleSaveToCarnet : undefined}
                  savingCarnet={ajouterObservation.isPending}
                />
              </MessageRow>
            ))}
            {chat.isPending && (
              <MessageRow>
                <MetaLabel><Bot size={11} /> Dr. DjamSanté</MetaLabel>
                <Bubble>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SpinIcon size={14} />
                    <TypingDots><span /><span /><span /></TypingDots>
                  </div>
                </Bubble>
              </MessageRow>
            )}
            {showSuggestions && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {suggestions.map((s) => (
                  <SuggestionChip key={s} type="button" onClick={() => send(s)}>
                    {s.length > 35 ? `${s.slice(0, 35)}…` : s}
                  </SuggestionChip>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </Messages>

          <InputRow onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isMedecin ? 'Conseil patient ou mode formation…' : 'Décrivez votre situation…'}
              disabled={chat.isPending}
            />
            <button type="submit" disabled={chat.isPending || !input.trim()}>
              <Send size={16} />
            </button>
          </InputRow>
        </Panel>
      )}

      <FAB $lifted={liftFab} onClick={() => setOpen((o) => !o)} aria-label="Dr. DjamSanté" title="Dr. DjamSanté — Assistant IA">
        {open ? <X size={26} /> : <Bot size={26} />}
      </FAB>
    </>
  );
}
