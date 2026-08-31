import { useTheme } from 'styled-components';
import useMediaQuery from './useMediaQuery';

/**
 * Breakpoints réactifs alignés sur le thème — s'adapte à la taille d'écran.
 */
export default function useBreakpoint() {
  const theme = useTheme();
  const { sm, md, lg } = theme.breakpoints;

  const isSm = useMediaQuery(`(max-width: ${sm})`);
  const isMdDown = useMediaQuery(`(max-width: ${md})`);
  const isLgDown = useMediaQuery(`(max-width: ${lg})`);
  const isMdUp = useMediaQuery(`(min-width: ${md})`);
  const isLgUp = useMediaQuery(`(min-width: ${lg})`);

  return {
    isMobile: isMdDown,
    isTablet: isMdUp && isLgDown,
    isDesktop: isLgUp,
    isSmallPhone: isSm,
    /** patient bottom nav */
    isCompact: isMdDown,
  };
}
