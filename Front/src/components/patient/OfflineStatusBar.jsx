import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync';

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  border-radius: 10px;
  background: #FEF3C7;
  border: 1px solid #FDE68A;
  font-size: 0.78rem;
  color: #92400E;

  button {
    border: none;
    background: #92400E;
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.72rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

export default function OfflineStatusBar() {
  const { t } = useTranslation();
  const { pending, syncing, flushQueue } = useOfflineSync();

  if (!pending && navigator.onLine) return null;

  return (
    <Bar>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <WifiOff size={14} />
        {!navigator.onLine
          ? t('pwa.offline')
          : t('offline.pending', { count: pending })}
      </span>
      {navigator.onLine && pending > 0 && (
        <button type="button" onClick={flushQueue} disabled={syncing}>
          <RefreshCw size={12} /> {syncing ? '…' : t('offline.sync')}
        </button>
      )}
    </Bar>
  );
}
