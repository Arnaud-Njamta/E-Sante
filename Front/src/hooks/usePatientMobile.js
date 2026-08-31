import { useTheme } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import useMediaQuery from './useMediaQuery';

/** true lorsque l'utilisateur patient est sur viewport mobile (≤ md) */
export default function usePatientMobile() {
  const theme = useTheme();
  const { role } = useAuth();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  return role === 'patient' && isMobile;
}
