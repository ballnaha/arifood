'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FFD700', // เหลือง
      light: '#FFED4A',
      dark: '#E6C200',
      contrastText: '#000000',
    },
    secondary: {
      main: '#000000', // ดำ
      dark: '#1A1A1A',
      contrastText: '#FFD700',
    },
    background: {
      default: '#FAFAFA', // ขาวอ่อน
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    divider: '#E0E0E0',
    success: {
      main: '#FFD700',
      contrastText: '#000000',
    },
  },
  typography: {
    fontFamily: 'Prompt, Roboto, sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#000000',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: '#000000',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
      color: '#000000',
    },
    body1: {
      fontSize: '0.875rem',
      color: '#000000',
    },
    body2: {
      fontSize: '0.75rem',
      color: '#666666',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          boxShadow: 'none',
          borderBottom: '1px solid #E0E0E0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #F0F0F0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        },
        contained: {
          backgroundColor: '#FFD700',
          color: '#000000',
          boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
          '&:hover': {
            backgroundColor: '#E6C200',
            boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderColor: '#FFD700',
          color: '#FFD700',
          '&:hover': {
            borderColor: '#E6C200',
            backgroundColor: 'rgba(255, 215, 0, 0.08)',
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          height: '68px',
          overflow: 'hidden',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#666666',
          minWidth: 'auto',
          padding: '8px 12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '16px',
          margin: '6px 4px',
          position: 'relative',
          '&.Mui-selected': {
            color: '#000000',
            backgroundColor: '#FFD700',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
              borderRadius: '16px',
              pointerEvents: 'none',
            },
          },
          '&:hover:not(.Mui-selected)': {
            color: '#FFD700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 500,
            marginTop: '2px',
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#000000',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFD700',
          color: '#000000',
          fontWeight: 600,
          borderRadius: '20px',
          border: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#E6C200',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: '#FFD700',
          color: '#FFD700',
          '&:hover': {
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            borderColor: '#E6C200',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme; 