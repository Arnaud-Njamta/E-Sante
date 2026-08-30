import baseTokens from './tokens';
import { getBranding } from '../config/branding';

export function buildTheme(role = 'patient') {
  const branding = getBranding(role);
  return {
    ...baseTokens,
    branding,
    colors: {
      ...baseTokens.colors,
      primary: branding.primary,
      borderFocus: branding.primary[500] || baseTokens.colors.deep,
    },
  };
}

export default buildTheme;
