import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, ScanLine, Heart, Wallet, Package, BarChart3, BookHeart,
} from 'lucide-react';

const Scroll = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 2px 2px 6px;
    margin-bottom: ${({ theme }) => theme.spacing[5]};
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar { display: none; }
  }
`;

const Tile = styled.button`
  flex: 0 0 auto;
  min-width: 92px;
  padding: 14px 10px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.spring},
    box-shadow ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:active {
    transform: scale(0.96);
    border-color: ${({ theme }) => theme.colors.primary[200]};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const TileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};

  svg { width: 20px; height: 20px; }
`;

const TileLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  line-height: 1.2;
`;

const ACTIONS = [
  { to: '/rendez-vous', icon: Calendar, label: 'RDV', bg: '#ECFDF5', color: '#007A5E' },
  { to: '/carnet-medical', icon: BookHeart, label: 'Carnet', bg: '#FDF2F8', color: '#DB2777' },
  { to: '/ordonnances', icon: ScanLine, label: 'Scanner', bg: '#F0FDF4', color: '#16A34A' },
  { to: '/medications', icon: Heart, label: 'Médicaments', bg: '#FFF7ED', color: '#EA580C' },
  { to: '/reservations', icon: Package, label: 'Réservations', bg: '#EFF6FF', color: '#2563EB' },
  { to: '/paiements', icon: Wallet, label: 'Paiements', bg: '#F5F3FF', color: '#7C3AED' },
  { to: '/analytics', icon: BarChart3, label: 'Stats', bg: '#FEF3C7', color: '#D97706' },
];

export default function PatientMobileQuickActions() {
  const navigate = useNavigate();

  return (
    <Scroll aria-label="Accès rapide">
      {ACTIONS.map((action) => (
        <Tile key={action.to} type="button" onClick={() => navigate(action.to)}>
          <TileIcon $bg={action.bg} $color={action.color}>
            <action.icon />
          </TileIcon>
          <TileLabel>{action.label}</TileLabel>
        </Tile>
      ))}
    </Scroll>
  );
}
