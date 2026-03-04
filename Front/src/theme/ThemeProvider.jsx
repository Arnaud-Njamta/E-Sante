import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import tokens from './tokens';
import GlobalStyles from './GlobalStyles';

export default function ThemeProvider({ children }) {
    return (
        <StyledThemeProvider theme={tokens}>
            <GlobalStyles />
            {children}
        </StyledThemeProvider>
    );
}
