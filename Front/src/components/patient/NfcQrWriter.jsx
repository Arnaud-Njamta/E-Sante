import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Nfc, Smartphone } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const Box = styled.div`
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  border: 1px dashed #A7F3D0;
  background: #ECFDF5;
  max-width: 400px;
  text-align: center;

  p { font-size: 0.8rem; color: #065F46; margin: 8px 0 0; }
`;

export default function NfcQrWriter({ qrUrl }) {
  const { t } = useTranslation();
  const [supported, setSupported] = useState(false);
  const [writing, setWriting] = useState(false);

  React.useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'NDEFReader' in window);
  }, []);

  const writeNfc = useCallback(async () => {
    if (!qrUrl || !supported) return;
    setWriting(true);
    try {
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: qrUrl }],
      });
      toast.success(t('nfc.written'));
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        toast.error(t('nfc.denied'));
      } else {
        toast.error(t('nfc.error'));
      }
    } finally {
      setWriting(false);
    }
  }, [qrUrl, supported, t]);

  if (!supported) {
    return (
      <Box>
        <Smartphone size={24} color="#059669" />
        <p>{t('nfc.unsupported')}</p>
      </Box>
    );
  }

  return (
    <Box>
      <Nfc size={28} color="#059669" />
      <p>{t('nfc.hint')}</p>
      <Button size="sm" onClick={writeNfc} disabled={writing || !qrUrl} style={{ marginTop: 12 }}>
        {writing ? '…' : t('nfc.write')}
      </Button>
    </Box>
  );
}
