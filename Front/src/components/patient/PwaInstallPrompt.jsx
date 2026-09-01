import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';

const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #065F46, #047857);
  color: white;
  font-size: 0.8rem;

  button {
    border: none;
    background: rgba(255,255,255,0.2);
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .close {
    background: none;
    padding: 4px;
    opacity: 0.7;
  }
`;

export default function PwaInstallPrompt() {
  const { t } = useTranslation();
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa_dismissed') === '1');

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferred || dismissed) return null;

  const install = async () => {
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const dismiss = () => {
    localStorage.setItem('pwa_dismissed', '1');
    setDismissed(true);
  };

  return (
    <Banner>
      <span>{t('pwa.install')}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" onClick={install}><Download size={14} /> Installer</button>
        <button type="button" className="close" onClick={dismiss} aria-label="Fermer"><X size={16} /></button>
      </div>
    </Banner>
  );
}
