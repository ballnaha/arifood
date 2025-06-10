'use client';
import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import theme from './theme';

interface ClientThemeProviderProps {
  children: React.ReactNode;
}

export default function ClientThemeProvider({ children }: ClientThemeProviderProps) {
  // ใช้ useMemo เพื่อให้ cache เสถียร
  const emotionCache = useMemo(() => createCache({ 
    key: 'mui', 
    prepend: true,
    // ป้องกัน CSS insertion order ที่อาจทำให้เกิด hydration mismatch
    insertionPoint: typeof document !== 'undefined' ? 
      (document.querySelector('#emotion-insertion-point') as HTMLElement) || undefined : 
      undefined,
  }), []);

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
} 