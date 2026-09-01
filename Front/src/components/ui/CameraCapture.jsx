import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Camera, X, Loader2 } from 'lucide-react';
import Button from './Button';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Video = styled.video`
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  background: #000;
`;

const Canvas = styled.canvas` display: none; `;

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (err) {
        setError('Caméra inaccessible — autorisez l\'accès ou utilisez l\'import fichier');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `ordonnance-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.92);
  };

  return (
    <Overlay>
      <div style={{ width: '100%', maxWidth: 480, marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </div>
      {error ? (
        <p style={{ color: '#fca5a5', textAlign: 'center' }}>{error}</p>
      ) : (
        <>
          <Video ref={videoRef} playsInline muted />
          <Canvas ref={canvasRef} />
          <Button onClick={capture} disabled={!ready} style={{ marginTop: 16 }}>
            {ready ? <><Camera size={16} /> Capturer l&apos;ordonnance</> : <><Loader2 size={16} className="spin" /> Initialisation...</>}
          </Button>
        </>
      )}
    </Overlay>
  );
}
