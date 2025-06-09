'use client';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';


export default function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Get current nav value based on pathname
  const getCurrentValue = () => {
    if (pathname === '/') return 0;
    if (pathname.startsWith('/categories') || pathname.startsWith('/search')) return 1;
    if (pathname.startsWith('/history')) return 2;
    if (pathname.startsWith('/profile')) return 3;
    return 0;
  };

  const [value, setValue] = useState(getCurrentValue());

  useEffect(() => {
    setMounted(true);
    setValue(getCurrentValue());
  }, [pathname]);

  const handleNavigation = (newValue: number) => {
    setValue(newValue);
    switch(newValue) {
      case 0:
        router.push('/');
        break;
      case 1:
        router.push('/search');
        break;
      case 2:
        router.push('/history');
        break;
      case 3:
        router.push('/profile');
        break;
    }
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        px: 2,
        pb: { xs: 2, sm: 2 },
        pt: 1,
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => handleNavigation(newValue)}
        showLabels
        sx={{
          bgcolor: '#000000',
          borderRadius: '20px',
          height: { xs: 68, sm: 72 },
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          overflow: 'hidden',
          '& .MuiBottomNavigationAction-root': {
            color: '#ffffff',
            minWidth: 'auto',
            padding: '8px 12px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '16px',
            margin: '6px 4px',
            position: 'relative',
            '&.Mui-selected': {
              color: '#000000',
              bgcolor: '#FFD700',
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
              bgcolor: 'rgba(255, 215, 0, 0.1)',
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
        }}
      >
        <BottomNavigationAction 
          label="หน้าแรก"
          icon={<HomeIcon sx={{ fontSize: '1.3rem' }} />}
        />
        <BottomNavigationAction 
          label="ค้นหา"
          icon={<SearchIcon sx={{ fontSize: '1.3rem' }} />}
        />
        <BottomNavigationAction 
          label="คำสั่งซื้อ"
          icon={<HistoryIcon sx={{ fontSize: '1.3rem' }} />}
        />
        <BottomNavigationAction 
          label="อื่นๆ"
          icon={<MoreVertIcon sx={{ fontSize: '1.3rem' }} />}
        />
      </BottomNavigation>
      
    </Box>
  );
} 