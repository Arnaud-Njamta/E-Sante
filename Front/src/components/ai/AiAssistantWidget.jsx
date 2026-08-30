import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import {
  Bot, X, Send, AlertTriangle, Loader2, Stethoscope,
  Shield, Video, UserRound, Calendar,
} from 'lucide-react';
import { useAiChat, useAiBookRdv } from '../../hooks/useAiAssistant';
import { useAuth } from '../../context/AuthContext';
import {
  WELCOME_AI_PATIENT, WELCOME_AI_MEDECIN, EMERGENCY, EMERGENCY_FOOTER,
  EMERGENCY_SHORT, CAMEROON_COLORS, SUGGESTIONS_PATIENT, SUGGESTIONS_MEDECIN,
  FEMINICIDE_BANNER,
} from '../../config/cameroonHealth';
import toast from 'react-hot-toast';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(206, 17, 38, 0.45); }
  50% { box-shadow: 0 0 0 12px rgba(206, 17, 38, 0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const FAB = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid ${CAMEROON_COLORS.yellow};
  background: linear-gradient(145deg, ${CAMEROON_COLORS.red}, ${CAMEROON_COLORS.redDark});
  color: white;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(206, 17, 38, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: ${pulse} 2.5s ease-in-out infinite;

  &:hover { transform: scale(1.06); }
`;

const Panel = styled.div`
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: 400px;
  max-width: calc(100vw - 24px);
  height: 580px;
  max-height: calc(100vh - 110px);
  background: #FAFBFC;
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 122, 94, 0.12);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 16px 18px;
  background: linear-gradient(135deg, ${CAMEROON_COLORS.green} 0%, ${CAMEROON_COLORS.greenDark} 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3px solid ${CAMEROON_COLORS.yellow};

  .info { display: flex; align-items: center; gap: 12px; }
  .avatar {
    width: 40px; height: 40px; border-radius: 12px;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    border: 2px solid ${CAMEROON_COLORS.yellow};
  }
  h3 { margin: 0; font-size: 0.95rem; font-weight: 700; }
  p { margin: 2px 0 0; font-size: 0.7rem; opacity: 0.9; }
  button {
    background: rgba(255,255,255,0.15);
    border: none; border-radius: 10px;
    color: white; cursor: pointer; padding: 6px;
    display: flex;
    &:hover { background: rgba(255,255,255,0.25); }
  }
`;

const AwarenessStrip = styled.div`
  padding: 8px 14px;
  background: linear-gradient(90deg, ${CAMEROON_COLORS.red}15, ${CAMEROON_COLORS.yellow}20);
  border-bottom: 1px solid ${CAMEROON_COLORS.red}30;
  font-size: 0.68rem;
  color: #7F1D1D;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.35;

  strong { color: ${CAMEROON_COLORS.redDark}; }
`;

const Disclaimer = styled.div`
  padding: 8px 14px;
  background: #FFFBEB;
  color: #92400E;
  font-size: 0.68rem;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.4;
  border-bottom: 1px solid #FDE68A;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
`;

const MessageRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $user }) => ($user ? 'flex-end' : 'flex-start')};
  gap: 4px;
  max-width: 92%;
  align-self: ${({ $user }) => ($user ? 'flex-end' : 'flex-start')};
`;

const Bubble = styled.div`
  padding: 11px 14px;
  border-radius: ${({ $user }) => ($user ? '16px 16px 4px 16px' : '16px 16px 16px 4px')};
  font-size: 0.84rem;
  line-height: 1.55;
  white-space: pre-wrap;
  background: ${({ $user }) => ($user
    ? `linear-gradient(135deg, ${CAMEROON_COLORS.green}, ${CAMEROON_COLORS.greenDark})`
    : 'white')};
  color: ${({ $user }) => ($user ? 'white' : '#1E293B')};
  border: ${({ $user }) => ($user ? 'none' : '1px solid #E2E8F0')};
  box-shadow: ${({ $user }) => ($user ? '0 2px 8px rgba(0,122,94,0.25)' : '0 1px 4px rgba(0,0,0,0.04)')};

  strong { font-weight: 700; }
`;

const MetaLabel = styled.span`
  font-size: 0.65rem;
  color: #94A3B8;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
`;

const RecCard = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  background: white;
  border: 1px solid ${CAMEROON_COLORS.green}40;
  border-left: 4px solid ${CAMEROON_COLORS.green};
  border-radius: 10px;

  .name { font-weight: 700; font-size: 0.82rem; color: ${CAMEROON_COLORS.greenDark}; }
  .spec { font-size: 0.72rem; color: #64748B; margin-top: 2px; }
  .motif { font-size: 0.72rem; color: #475569; margin-top: 4px; font-style: italic; }
  .slots { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .profile-link {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.68rem; color: ${CAMEROON_COLORS.green}; margin-top: 8px;
    text-decoration: none; font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

const SlotBtn = styled.button`
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid ${CAMEROON_COLORS.green}50;
  background: #F0FDF9;
  font-size: 0.68rem;
  cursor: pointer;
  color: ${CAMEROON_COLORS.greenDark};
  display: flex; align-items: center; gap: 4px;
  transition: all 0.15s;

  &:hover:not(:disabled) { background: ${CAMEROON_COLORS.green}; color: white; }
  &:disabled { opacity: 0.5; cursor: wait; }
`;

const ProtocolCard = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-left: 4px solid ${CAMEROON_COLORS.red};
  border-radius: 10px;

  .title { font-weight: 700; font-size: 0.8rem; color: ${CAMEROON_COLORS.redDark}; margin-bottom: 8px; }
  .step {
    display: flex; gap: 8px; margin-bottom: 6px;
    font-size: 0.72rem; color: #7F1D1D; line-height: 1.4;
  }
  .num {
    flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
    background: ${CAMEROON_COLORS.red}; color: white;
    font-size: 0.65rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
`;

const VideoCard = styled.a`
  display: block;
  margin-top: 8px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #E2E8F0;
  text-decoration: none;
  color: inherit;
  background: white;

  .thumb {
    position: relative;
    padding-top: 56.25%;
    background: #1E293B;
  }
  iframe {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; border: none;
  }
  .info { padding: 8px 10px; }
  .title { font-size: 0.75rem; font-weight: 600; color: #1E293B; }
  .source { font-size: 0.65rem; color: #94A3B8; margin-top: 2px; }
`;

const SuggestionChip = styled.button`
  padding: 7px 12px;
  border-radius: 20px;
  border: 1px solid ${CAMEROON_COLORS.green}40;
  background: white;
  font-size: 0.72rem;
  cursor: pointer;
  color: ${CAMEROON_COLORS.greenDark};
  transition: all 0.15s;

  &:hover {
    background: ${CAMEROON_COLORS.green};
    color: white;
    border-color: ${CAMEROON_COLORS.green};
  }
`;

const InputRow = styled.form`
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid #E2E8F0;
  background: white;

  input {
    flex: 1;
    padding: 11px 14px;
    border: 1.5px solid #E2E8F0;
    border-radius: 12px;
    font-size: 0.84rem;
    outline: none;
    &:focus { border-color: ${CAMEROON_COLORS.green}; box-shadow: 0 0 0 3px ${CAMEROON_COLORS.green}20; }
  }

  button {
    padding: 11px 14px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, ${CAMEROON_COLORS.green}, ${CAMEROON_COLORS.greenDark});
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
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
    background: ${CAMEROON_COLORS.green};
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
    .replace(/^> (.+)$/gm, '<em style="color:#64748B">$1</em>');
}

function formatSlotDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function MessageContent({ msg, onBookSlot, bookingKey, isPatient }) {
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
          {rec.specialite}{rec.ville ? ` · ${rec.ville}` : ''}{rec.note ? ` · ★ ${rec.note}` : ''}
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
  </>
  );
}

export default function AiAssistantWidget() {
  const { role } = useAuth();
  const isMedecin = role === 'medecin';
  const isPatient = role === 'patient';
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

  const send = async (text) => {
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
      const data = await chat.mutateAsync({ message, history });
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
  };

  const showSuggestions = useMemo(
    () => messages.length === 1 && messages[0].role === 'assistant',
    [messages],
  );

  return (
    <>
      {open && (
        <Panel>
          <Header>
            <div className="info">
              <div className="avatar"><Bot size={22} /></div>
              <div>
                <h3>Dr. DjamSanté 🇨🇲</h3>
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

      <FAB onClick={() => setOpen((o) => !o)} aria-label="Dr. DjamSanté" title="Dr. DjamSanté — Assistant IA">
        {open ? <X size={26} /> : <Bot size={26} />}
      </FAB>
    </>
  );
}
