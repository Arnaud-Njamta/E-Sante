import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode, AlertTriangle, Droplets, Phone, User, Camera, X,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import client from '../api/client';
import ENDPOINTS from '../api/endpoints';

const ScannerBox = styled(Card)`
  padding: 0;
  overflow: hidden;
  margin-bottom: 20px;
  max-width: 480px;

  #qr-reader {
    width: 100%;
    border: none;
  }
`;

const ResultCard = styled(Card)`
  padding: 20px;
  max-width: 480px;
  border-left: 4px solid ${({ $alert }) => ($alert ? '#DC2626' : '#059669')};

  h3 { margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
  .row { margin-bottom: 10px; font-size: 0.9rem; }
  .label { font-size: 0.7rem; text-transform: uppercase; color: #94A3B8; letter-spacing: 0.06em; }
`;

function extractToken(decodedText) {
  if (!decodedText) return null;
  const match = decodedText.match(/\/qr\/([a-f0-9]+)/i);
  if (match) return match[1];
  if (/^[a-f0-9]{32,}$/i.test(decodedText.trim())) return decodedText.trim();
  return null;
}

export default function ProQrScanPage() {
  const { t } = useTranslation();
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const fetchQrData = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.get(ENDPOINTS.qrMedical.public(token));
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('qr.not_found'));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setResult(null);
    setError(null);
    setScanning(true);

    await new Promise((r) => setTimeout(r, 100));

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decoded) => {
          const token = extractToken(decoded);
          if (!token) return;
          await stopScanner();
          await fetchQrData(token);
        },
        () => {},
      );
    } catch {
      setError('Caméra inaccessible — autorisez l\'accès ou saisissez le token manuellement');
      setScanning(false);
    }
  };

  useEffect(() => () => { stopScanner(); }, []);

  const handleManual = () => {
    const token = window.prompt('Collez le token QR ou l\'URL scannée :');
    if (token) fetchQrData(extractToken(token) || token);
  };

  return (
    <>
      <PageHeader
        title={t('qrScan.title')}
        subtitle={t('qrScan.subtitle')}
        icon={<QrCode size={24} />}
      />

      {!scanning && !result && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Button onClick={startScanner}><Camera size={16} /> {t('qrScan.start')}</Button>
          <Button variant="outline" onClick={handleManual}>{t('qrScan.manual')}</Button>
        </div>
      )}

      {scanning && (
        <>
          <ScannerBox><div id="qr-reader" /></ScannerBox>
          <Button variant="outline" onClick={stopScanner}><X size={14} /> {t('qrScan.stop')}</Button>
        </>
      )}

      {loading && <Spinner text={t('common.loading')} />}

      {error && (
        <ResultCard $alert>
          <h3><AlertTriangle size={20} color="#DC2626" /> {error}</h3>
          <Button size="sm" onClick={startScanner} style={{ marginTop: 12 }}>{t('qrScan.retry')}</Button>
        </ResultCard>
      )}

      {result && (
        <ResultCard $alert={result.allergies?.length > 0}>
          <h3><User size={20} /> {result.prenom} {result.nom}</h3>
          {result.relation && <div className="row">{result.relation}</div>}
          {result.groupe_sanguin && (
            <div className="row">
              <div className="label"><Droplets size={12} /> {t('qr.blood')}</div>
              <strong>{result.groupe_sanguin}</strong>
            </div>
          )}
          {result.allergies?.length > 0 && (
            <div className="row" style={{ color: '#DC2626' }}>
              <div className="label"><AlertTriangle size={12} /> {t('qr.allergies')}</div>
              <strong>{result.allergies.join(' · ')}</strong>
            </div>
          )}
          {result.pathologies?.length > 0 && (
            <div className="row">
              <div className="label">Pathologies</div>
              {result.pathologies.join(' · ')}
            </div>
          )}
          {result.contact_urgence && (
            <div className="row">
              <div className="label"><Phone size={12} /> {t('qr.contact')}</div>
              <a href={`tel:${result.contact_urgence}`}>{result.contact_urgence}</a>
            </div>
          )}
          <Button size="sm" onClick={() => { setResult(null); startScanner(); }} style={{ marginTop: 12 }}>
            {t('qrScan.another')}
          </Button>
        </ResultCard>
      )}
    </>
  );
}
