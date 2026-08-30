import React, { useMemo, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { buildTheme } from './buildTheme';
import { getBranding } from '../config/branding';
import GlobalStyles from './GlobalStyles';

export default function ThemeProvider({ children }) {
    const { role } = useAuth();
    const theme = useMemo(() => buildTheme(role), [role]);

    useEffect(() => {
        const branding = getBranding(role);
        document.title = branding.appName;
    }, [role]);

    return (
        <StyledThemeProvider theme={theme}>
            <GlobalStyles />
            {children}
        </StyledThemeProvider>
    );
}
