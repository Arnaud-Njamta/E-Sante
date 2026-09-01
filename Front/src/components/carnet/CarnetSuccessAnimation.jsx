import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { BookHeart, CheckCircle } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const bookOpen = keyframes`
  0% { transform: scale(0.6) rotateY(-30deg); opacity: 0; }
  50% { transform: scale(1.08) rotateY(8deg); opacity: 1; }
  100% { transform: scale(1) rotateY(0deg); opacity: 1; }
`;

const checkPop = keyframes`
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 61, 48, 0.72);
  backdrop-filter: blur(8px);
  animation: ${({ $closing }) => ($closing ? fadeOut : fadeIn)} 0.5s ease both;
  padding: 24px;
`;

const Scene = styled.div`
  text-align: center;
  color: white;
  max-width: 320px;
`;

const BookWrap = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  border-radius: 24px;
  background: linear-gradient(145deg, #10B981, #047857);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  animation: ${bookOpen} 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  svg { width: 48px; height: 48px; }
`;

const CheckWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  animation: ${checkPop} 0.5s 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  svg { width: 28px; height: 28px; color: #6EE7B7; }
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 1.5rem;
  font-weight: 800;
  animation: ${fadeIn} 0.5s 0.5s ease both;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.5;
  animation: ${fadeIn} 0.5s 0.65s ease both;
`;

const Progress = styled.div`
  margin-top: 28px;
  height: 3px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, transparent, #6EE7B7, transparent);
    background-size: 200% 100%;
    animation: ${shimmer} 1.2s 0.8s ease infinite;
  }
`;

export default function CarnetSuccessAnimation({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <Overlay aria-live="polite" role="status">
      <Scene>
        <BookWrap><BookHeart /></BookWrap>
        <CheckWrap><CheckCircle /> Carnet activé</CheckWrap>
        <Title>Votre carnet est prêt</Title>
        <Subtitle>
          Vos informations de santé sont enregistrées en toute sécurité.
          Vous pourrez les modifier à tout moment.
        </Subtitle>
        <Progress />
      </Scene>
    </Overlay>
  );
}
