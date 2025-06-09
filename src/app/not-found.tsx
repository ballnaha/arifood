import type { Metadata } from 'next';
import {
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material';
import {
  Home as HomeIcon,
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

export const metadata: Metadata = {
  title: 'ไม่พบหน้าที่ต้องการ | AriFood',
  description: 'ขออภัย ไม่พบหน้าที่คุณกำลังหา',
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ClientOnly>
        <Container maxWidth="sm" sx={{ px: 2, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 120, color: '#9CA3AF', mb: 3 }} />
          
          <Typography variant="h4" fontWeight={600} gutterBottom sx={{ color: '#111827' }}>
            404
          </Typography>
          
          <Typography variant="h6" sx={{ color: '#6B7280' }} gutterBottom>
            ไม่พบหน้าที่ท่านค้นหา
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#6B7280', mb: 2, lineHeight: 1.6 }}>
            ขออภัย หน้าที่คุณกำลังหาอาจถูกลบหรือเปลี่ยนที่อยู่แล้ว
          </Typography>

          <Typography variant="body1" sx={{ color: '#374151', mb: 1, lineHeight: 1.6, fontWeight: 500 }}>
            แต่เราขอแนะนำเมนูสุดฮิตของเรา! 🍛
          </Typography>

          <Typography variant="body2" sx={{ color: '#6B7280', mb: 4, lineHeight: 1.6, fontStyle: 'italic' }}>
            "ข้าวผัดกระเพรา ต้มยำกุ้ง และผัดไทยกุ้งสด" 
            <br />
            รสชาติต้นตำรับไทยแท้ ที่จะทำให้คุณลืมเรื่องหน้า 404 ไปเลย!
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/"
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '12px',
                backgroundColor: '#FFD700',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#FFD700'
                }
              }}
            >
              กลับหน้าแรก
            </Button>

            <Button
              component={Link}
              href="/products/%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%9C%E0%B8%B1%E0%B8%94%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%9E%E0%B8%A3%E0%B8%B2%E0%B8%81%E0%B8%B8%E0%B9%89%E0%B8%87"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '12px',
                borderColor: '#FFD700',
                color: '#FFD700',
                '&:hover': {
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                }
              }}
            >
              ดูเมนูแนะนำ 🍜
            </Button>
          </Box>
        </Container>
      </ClientOnly>
    </div>
  );
} 