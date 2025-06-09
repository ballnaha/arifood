'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MUIThemeProvider = dynamic(
  () => import('@mui/material/styles').then((mod) => mod.ThemeProvider),
  { ssr: false }
);

const CssBaseline = dynamic(
  () => import('@mui/material/CssBaseline'),
  { ssr: false }
);

import theme from './theme';

interface ClientThemeProviderProps {
  children: React.ReactNode;
}

export default function ClientThemeProvider({ children }: ClientThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
} 