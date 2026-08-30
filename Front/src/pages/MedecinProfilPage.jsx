import React from 'react';
import { useAuth } from '../context/AuthContext';
import MedecinDetailPage from './MedecinDetailPage';

export default function MedecinProfilPage() {
  const { user } = useAuth();
  if (!user?.id) return null;
  return <MedecinDetailPage overrideId={user.id} isOwnProfile />;
}
