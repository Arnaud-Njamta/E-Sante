import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, Calendar, MessageCircle, Inbox } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';

const Wrap = styled.div`
  position: relative;
`;

const Panel = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 340px;
  max-height: 420px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: ${({ theme }) => theme.zIndex.dropdown || 200};
`;

const PanelHeader = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
  font-size: 0.9rem;
`;

const Item = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  cursor: pointer;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  &:hover { background: ${({ theme }) => theme.colors.neutral[50]}; }
  &:last-child { border-bottom: none; }
`;

const IconWrap = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $bg }) => $bg || '#F1F5F9'};
  color: ${({ $color }) => $color || '#64748B'};
`;

const Empty = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #94A3B8;
  font-size: 0.85rem;
`;

const TYPE_ICON = {
  reservation: { icon: Package, bg: '#ECFDF5', color: '#059669' },
  rendez_vous: { icon: Calendar, bg: '#EFF6FF', color: '#2563EB' },
  message: { icon: MessageCircle, bg: '#F5F3FF', color: '#7C3AED' },
};

function resolveLink(link, role) {
  if (!link) return null;
  if (role === 'hopital') return link.replace('/pharmacie/', '/hopital/');
  if (role === 'clinique') return link.replace('/pharmacie/', '/clinique/');
  return link;
}

export default function NotificationBell({ button: ButtonEl }) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const [open, setOpen] = React.useState(false);
  const ref = useRef(null);

  const items = data?.items || [];
  const unread = data?.unread ?? items.length;

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <Wrap ref={ref}>
      <ButtonEl onClick={() => setOpen((o) => !o)} aria-label="Notifications" aria-expanded={open}>
        <Bell size={20} />
        {unread > 0 && <span className="notif-dot" />}
      </ButtonEl>
      {open && (
        <Panel>
          <PanelHeader>Notifications {unread > 0 && `(${unread})`}</PanelHeader>
          {isLoading ? (
            <Empty>Chargement...</Empty>
          ) : items.length === 0 ? (
            <Empty><Inbox size={28} style={{ marginBottom: 8 }} /><br />Aucune notification pour le moment</Empty>
          ) : (
            items.map((n) => {
              const cfg = TYPE_ICON[n.type] || TYPE_ICON.message;
              const Icon = cfg.icon;
              return (
                <Item
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    const path = resolveLink(n.link, role);
                    if (path) navigate(path);
                  }}
                >
                  <IconWrap $bg={cfg.bg} $color={cfg.color}><Icon size={18} /></IconWrap>
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>{n.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{n.message}</span>
                  </div>
                </Item>
              );
            })
          )}
        </Panel>
      )}
    </Wrap>
  );
}
