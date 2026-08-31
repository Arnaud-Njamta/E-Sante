import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';
import { messageriePollOptions } from '../config/queryDefaults';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  height: calc(100vh - 140px);
  @media (max-width: 800px) { grid-template-columns: 1fr; height: auto; }
`;

const ConvItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 14px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary[50] : 'transparent')};
  cursor: pointer;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Bubble = styled.div`
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.9rem;
  align-self: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  background: ${({ $mine, theme }) => ($mine ? theme.colors.primary[500] : theme.colors.surface)};
  color: ${({ $mine }) => ($mine ? 'white' : 'inherit')};
  border: ${({ $mine, theme }) => ($mine ? 'none' : `1px solid ${theme.colors.border}`)};
`;

export default function PharmacieMessagesPage() {
  const { conversationId } = useParams();
  const [selectedId, setSelectedId] = useState(conversationId);
  const [message, setMessage] = useState('');
  const endRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['structure', 'conversations'],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.messagerie.structureConversations);
      return data.data;
    },
  });

  const { data: conversation } = useQuery({
    queryKey: ['structure', 'conversation', selectedId],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.messagerie.structureConversation(selectedId));
      return data.data;
    },
    enabled: !!selectedId,
    ...messageriePollOptions,
  });

  const sendMutation = useMutation({
    mutationFn: async (contenu) => {
      const { data } = await client.post(ENDPOINTS.messagerie.structureMessage(selectedId), { contenu });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure', 'conversation', selectedId] });
      setMessage('');
    },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation?.messages]);
  useEffect(() => { if (conversationId) setSelectedId(conversationId); }, [conversationId]);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ margin: '0 0 20px' }}>Messages patients</h1>
      <Layout>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {conversations?.map((c) => (
            <ConvItem key={c.id} $active={selectedId === c.id} onClick={() => setSelectedId(c.id)}>
              <strong>{c.patient?.prenom} {c.patient?.nom}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                {c.messages?.[0]?.contenu?.slice(0, 60) || c.sujet}
              </p>
            </ConvItem>
          ))}
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {!selectedId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              Sélectionnez une conversation
            </div>
          ) : (
            <>
              <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0' }}>
                <strong>{conversation?.patient?.prenom} {conversation?.patient?.nom}</strong>
              </div>
              <Messages>
                {(conversation?.messages || []).map((m) => (
                  <Bubble key={m.id} $mine={m.expediteur_type === 'pharmacie'}>{m.contenu}</Bubble>
                ))}
                <div ref={endRef} />
              </Messages>
              <form
                style={{ display: 'flex', gap: 8, padding: 16, borderTop: '1px solid #E2E8F0' }}
                onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMutation.mutate(message.trim()); }}
              >
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Répondre au patient..."
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 20 }}
                />
                <Button type="submit" disabled={!message.trim()}><Send size={16} /></Button>
              </form>
            </>
          )}
        </Card>
      </Layout>
    </div>
  );
}
