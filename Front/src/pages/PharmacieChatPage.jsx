import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MessageCircle, Pill, ChevronLeft } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import StarRating from '../components/ui/StarRating';
import PatientPageHeader from '../components/patient/PatientPageHeader';
import usePatientMobile from '../hooks/usePatientMobile';
import { BOTTOM_NAV_HEIGHT } from '../components/layout/PatientBottomNav';
import {
  usePharmaciesChat,
  useConversation,
  useConversations,
  useDemarrerConversation,
  useEnvoyerMessage,
} from '../hooks/useMessagerie';

const PageWrap = styled.div`
  ${({ $mobileChat }) => $mobileChat && `
    @media (max-width: 768px) {
      margin: -12px -16px 0;
    }
  `}
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  height: calc(100vh - 120px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    height: auto;
  }

  ${({ $mobileChat }) => $mobileChat && `
    @media (max-width: 768px) {
      display: block;
      height: calc(100vh - 68px - ${BOTTOM_NAV_HEIGHT}px - 28px - env(safe-area-inset-bottom, 0px));
      margin: 0;
    }
  `}
`;

const Sidebar = styled(Card)`
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  ${({ $hideMobile }) => $hideMobile && `
    @media (max-width: 768px) { display: none; }
  `}
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h3 { margin: 0; font-size: 1rem; }
`;

const PharmaItem = styled.button`
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.spacing[4]};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[50] : 'transparent')};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover { background: ${({ theme }) => theme.colors.primary[50]}; }
  &:active { background: ${({ theme }) => theme.colors.primary[100]}; }
`;

const PharmaName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  strong { font-size: 0.9rem; }
`;

const PharmaCity = styled.p`
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ChatArea = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  min-height: 420px;

  ${({ $mobileChat }) => $mobileChat && `
    @media (max-width: 768px) {
      min-height: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
      box-shadow: none;
    }
  `}
`;

const ChatHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 10px;

  h3 { margin: 0; font-size: 1rem; }
  p { margin: 4px 0 0; font-size: 0.8rem; color: ${({ theme }) => theme.colors.textMuted}; }
`;

const BackBtn = styled.button`
  display: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: none;
  cursor: pointer;
  flex-shrink: 0;

  @media (max-width: 768px) { display: flex; }
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: 12px;
  -webkit-overflow-scrolling: touch;
`;

const Bubble = styled.div`
  max-width: 82%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.5;
  align-self: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  background: ${({ $mine, theme }) => ($mine ? theme.colors.primary[500] : theme.colors.surface)};
  color: ${({ $mine }) => ($mine ? 'white' : 'inherit')};
  border: ${({ $mine, theme }) => ($mine ? 'none' : `1px solid ${theme.colors.border}`)};
  box-shadow: ${({ $mine, theme }) => ($mine ? '0 2px 8px rgba(0,122,94,0.2)' : theme.shadows.xs)};
`;

const InputBar = styled.form`
  display: flex;
  gap: 8px;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  padding-bottom: calc(${({ theme }) => theme.spacing[3]} + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.full};
    font-size: 0.9rem;
    background: ${({ theme }) => theme.colors.neutral[50]};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary[400]};
      background: white;
    }
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[3]};
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  button {
    flex-shrink: 0;
    padding: 8px 14px;
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;

    &:active { background: ${({ theme }) => theme.colors.primary[50]}; }
  }
`;

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 40px;
  text-align: center;
  gap: 8px;

  svg { width: 40px; height: 40px; opacity: 0.35; }
`;

const MobileListIntro = styled.p`
  display: none;
  margin: 0 0 16px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    display: block;
  }
`;

export default function PharmacieChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const isPatientMobile = usePatientMobile();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: pharmacies, isLoading: pharmaLoading } = usePharmaciesChat();
  const { data: conversations } = useConversations();
  const { data: conversation, isLoading: convLoading, error, refetch } = useConversation(conversationId);
  const demarrerConv = useDemarrerConversation();
  const envoyerMsg = useEnvoyerMessage();

  const mobileChat = isPatientMobile && !!conversationId;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleStartChat = async (pharmacieId) => {
    try {
      const conv = await demarrerConv.mutateAsync({
        pharmacieId,
        message_initial: 'Bonjour, j\'aimerais savoir si un produit est disponible.',
      });
      navigate(`/pharmacie/chat/${conv.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !conversationId) return;
    await envoyerMsg.mutateAsync({ conversationId, contenu: message.trim() });
    setMessage('');
  };

  const quickSend = (text) => {
    if (!conversationId) return;
    envoyerMsg.mutateAsync({ conversationId, contenu: text });
  };

  if (pharmaLoading) return <Spinner />;

  return (
    <PageWrap $mobileChat={mobileChat}>
      {!mobileChat && (
        <PatientPageHeader
          title="Pharmacie en ligne"
          subtitle="Vérifiez la disponibilité de vos médicaments et les horaires d'ouverture"
        />
      )}

      {!conversationId && (
        <MobileListIntro>
          Choisissez une pharmacie pour démarrer une conversation
        </MobileListIntro>
      )}

      <Layout $mobileChat={mobileChat}>
        <Sidebar $hideMobile={mobileChat}>
          <SidebarHeader><h3>Pharmacies disponibles</h3></SidebarHeader>
          {pharmacies?.map((p) => {
            const existingConv = conversations?.find((c) => c.pharmacie_id === p.id || c.pharmacie?.id === p.id);
            return (
              <PharmaItem
                key={p.id}
                $active={conversation?.pharmacie_id === p.id || conversation?.pharmacie?.id === p.id}
                onClick={() => existingConv
                  ? navigate(`/pharmacie/chat/${existingConv.id}`)
                  : handleStartChat(p.id)}
              >
                <PharmaName>
                  <Pill size={16} />
                  <strong>{p.nom}</strong>
                </PharmaName>
                <PharmaCity>{p.ville}</PharmaCity>
                <StarRating rating={p.note_moyenne} size={12} />
              </PharmaItem>
            );
          })}
        </Sidebar>

        <ChatArea $mobileChat={mobileChat}>
          {!conversationId ? (
            <EmptyChat>
              <MessageCircle />
              <p>Sélectionnez une pharmacie pour démarrer une conversation</p>
            </EmptyChat>
          ) : convLoading ? (
            <Spinner />
          ) : error ? (
            <ErrorState message="Conversation introuvable" onRetry={refetch} />
          ) : (
            <>
              <ChatHeader>
                {isPatientMobile && (
                  <BackBtn type="button" onClick={() => navigate('/pharmacie/chat')} aria-label="Retour">
                    <ChevronLeft size={20} />
                  </BackBtn>
                )}
                <div>
                  <h3>{conversation.pharmacie?.nom}</h3>
                  <p>{conversation.pharmacie?.ville} — Réponse rapide garantie</p>
                </div>
              </ChatHeader>

              <QuickActions>
                <button type="button" onClick={() => quickSend('Bonjour, avez-vous du Doliprane 500mg en stock ?')}>
                  Doliprane disponible ?
                </button>
                <button type="button" onClick={() => quickSend('Quels sont vos horaires d\'ouverture aujourd\'hui ?')}>
                  Horaires aujourd'hui
                </button>
                <button type="button" onClick={() => quickSend('Êtes-vous ouverts en ce moment ?')}>
                  Ouvert maintenant ?
                </button>
              </QuickActions>

              <Messages>
                {(conversation.messages || []).map((msg) => (
                  <Bubble key={msg.id} $mine={msg.expediteur_type === 'patient'}>
                    {msg.contenu}
                  </Bubble>
                ))}
                <div ref={messagesEndRef} />
              </Messages>

              <InputBar onSubmit={handleSend}>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Demandez la disponibilité d'un produit..."
                />
                <Button type="submit" disabled={envoyerMsg.isPending || !message.trim()}>
                  <Send size={16} />
                </Button>
              </InputBar>
            </>
          )}
        </ChatArea>
      </Layout>
    </PageWrap>
  );
}
