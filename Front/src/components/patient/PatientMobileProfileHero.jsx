import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../ui/UserAvatar';
import {
  Calendar, Heart, Wallet, FileText, Package, BookHeart,
} from 'lucide-react';

const Hero = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing[5]};
    animation: fadeIn 0.4s ease both;
  }
`;

const HeroCard = styled.div`
  background: linear-gradient(145deg, ${({ theme }) => theme.colors.primary[600]}, ${({ theme }) => theme.colors.primary[800]});
  border-radius: 20px;
  padding: ${({ theme }) => theme.spacing[5]};
  color: white;
  box-shadow: 0 12px 32px rgba(0, 92, 71, 0.25);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const AvatarWrap = styled.div`
  margin-bottom: 12px;
`;

const HeroName = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
`;

const HeroEmail = styled.p`
  margin: 4px 0 0;
  font-size: 0.78rem;
  opacity: 0.85;
`;

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const QuickItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: 600;
  transition: background 0.15s ease;

  &:active { background: rgba(255, 255, 255, 0.25); }

  svg { width: 20px; height: 20px; }
`;

const LINKS = [
  { to: '/carnet-medical', icon: BookHeart, label: 'Carnet' },
  { to: '/rendez-vous', icon: Calendar, label: 'RDV' },
  { to: '/medications', icon: Heart, label: 'Médicaments' },
  { to: '/paiements', icon: Wallet, label: 'Paiements' },
  { to: '/ordonnances-electroniques', icon: FileText, label: 'Ordonnances' },
  { to: '/reservations', icon: Package, label: 'Réservations' },
];

export default function PatientMobileProfileHero() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <Hero>
      <HeroCard>
        <AvatarWrap>
          <UserAvatar
            user={user}
            role={role}
            size={56}
            round={false}
            borderless
            onClick={() => navigate('/profil')}
          />
        </AvatarWrap>
        <HeroName>{user?.prenom || 'Patient'} {user?.nom || ''}</HeroName>
        <HeroEmail>{user?.email}</HeroEmail>
        <QuickGrid>
          {LINKS.map((link) => (
            <QuickItem key={link.to} type="button" onClick={() => navigate(link.to)}>
              <link.icon />
              {link.label}
            </QuickItem>
          ))}
        </QuickGrid>
      </HeroCard>
    </Hero>
  );
}
