import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import toast from 'react-hot-toast';

const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
  border: 1px solid #A7F3D0;
`;

const Btn = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #047857;
  color: white;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function PushNotificationPrompt() {
  const { t } = useTranslation();
  const {
    supported, subscribed, loading, configured, subscribe, unsubscribe,
  } = usePushNotifications();

  if (!supported || !configured) return null;
  if (subscribed) return null;

  const handleEnable = async () => {
    const ok = await subscribe();
    if (ok) toast.success(t('push.enabled'));
    else toast.error(t('push.denied'));
  };

  return (
    <Card>
      <div>
        <strong style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bell size={16} /> {t('push.title')}
        </strong>
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#065F46' }}>{t('push.subtitle')}</p>
      </div>
      <Btn type="button" onClick={handleEnable} disabled={loading}>
        <Bell size={14} /> {loading ? '…' : t('push.enable')}
      </Btn>
    </Card>
  );
}

export function PushNotificationToggle() {
  const { t } = useTranslation();
  const { supported, subscribed, configured, subscribe, unsubscribe, loading } = usePushNotifications();

  if (!supported || !configured) return null;

  return (
    <Btn
      type="button"
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      style={{ background: subscribed ? '#64748B' : '#047857' }}
    >
      {subscribed ? <BellOff size={14} /> : <Bell size={14} />}
      {subscribed ? t('push.disable') : t('push.enable')}
    </Btn>
  );
}
