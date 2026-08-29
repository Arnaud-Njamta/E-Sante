import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Pill } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import StarRating from '../components/ui/StarRating';
import {
  usePharmaciesChat,
  useConversation,
  useConversations,
  useDemarrerConversation,
  useEnvoyerMessage,
} from '../hooks/useMessagerie';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  height: calc(100vh - 120px);
  @media (max-width: 900px) { grid-template-columns: 1fr; height: auto; }
`;

const Sidebar = styled(Card)`
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  &:hover { background: ${({ theme }) => theme.colors.primary[50]}; }
`;

const ChatArea = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h3 { margin: 0; }
  p { margin: 4px 0 0; font-size: 0.8rem; color: ${({ theme }) => theme.colors.textMuted}; }
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Bubble = styled.div`
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.5;
  align-self: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  background: ${({ $mine, theme }) => ($mine ? theme.colors.primary[500] : theme.colors.surface)};
  color: ${({ $mine }) => ($mine ? 'white' : 'inherit')};
  border: ${({ $mine, theme }) => ($mine ? 'none' : `1px solid ${theme.colors.border}`)};
`;

const InputBar = styled.form`
  display: flex;
  gap: 8px;
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.full};
    font-size: 0.9rem;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  button {
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};
    font-size: 0.75rem;
    cursor: pointer;
    &:hover { background: ${({ theme }) => theme.colors.primary[50]}; }
  }
`;

export default function PharmacieChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: pharmacies, isLoading: pharmaLoading } = usePharmaciesChat();
  const { data: conversations } = useConversations();
  const { data: conversation, isLoading: convLoading, error, refetch } = useConversation(conversationId);
  const demarrerConv = useDemarrerConversation();
  const envoyerMsg = useEnvoyerMessage();

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
    <div>
      <button
        onClick={() => navigate('/sante')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, color: '#64748B' }}
      >
        <ArrowLeft size={18} /> Retour
      </button>

      <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem' }}>
        <MessageCircle size={24} style={{ verticalAlign: 'middle' }} /> Pharmacie en ligne
      </h1>
      <p style={{ color: '#64748B', margin: '0 0 20px' }}>
        Vérifiez la disponibilité de vos médicaments et les horaires d'ouverture
      </p>

      <Layout>
        <Sidebar>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill size={16} />
                  <strong style={{ fontSize: '0.9rem' }}>{p.nom}</strong>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>{p.ville}</p>
                <StarRating rating={p.note_moyenne} size={12} />
              </PharmaItem>
            );
          })}
        </Sidebar>

        <ChatArea>
          {!conversationId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', padding: 40 }}>
              Sélectionnez une pharmacie pour démarrer une conversation
            </div>
          ) : convLoading ? (
            <Spinner />
          ) : error ? (
            <ErrorState message="Conversation introuvable" onRetry={refetch} />
          ) : (
            <>
              <ChatHeader>
                <h3>{conversation.pharmacie?.nom}</h3>
                <p>{conversation.pharmacie?.ville} — Réponse rapide garantie</p>
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
    </div>
  );
}
