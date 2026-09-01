import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'djamsante_famille_profil_id';

const FamilleProfilContext = createContext(null);

export function FamilleProfilProvider({ children }) {
  const { isPatient } = useAuth();
  const [activeProfilId, setActiveProfilId] = useState(() => {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY) || null;
  });
  const [profils, setProfils] = useState([]);

  useEffect(() => {
    if (!isPatient) {
      setActiveProfilId(null);
      return;
    }
    if (activeProfilId) {
      localStorage.setItem(STORAGE_KEY, activeProfilId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeProfilId, isPatient]);

  const activeProfil = useMemo(
    () => profils.find((p) => p.id === activeProfilId) || null,
    [profils, activeProfilId],
  );

  const switchProfil = (id) => {
    setActiveProfilId(id || null);
  };

  const value = useMemo(() => ({
    activeProfilId,
    activeProfil,
    profils,
    setProfils,
    switchProfil,
    isFamilleMode: !!activeProfilId,
  }), [activeProfilId, activeProfil, profils]);

  return (
    <FamilleProfilContext.Provider value={value}>
      {children}
    </FamilleProfilContext.Provider>
  );
}

export function useFamilleProfil() {
  const ctx = useContext(FamilleProfilContext);
  if (!ctx) throw new Error('useFamilleProfil must be used within FamilleProfilProvider');
  return ctx;
}

export default FamilleProfilContext;
