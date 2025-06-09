'use client'

import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  IconButton,
  Card,
  CardContent
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon
} from '@mui/icons-material'
import BottomNavbar from '@/components/BottomNavbar'

export default function HistoryPage() {
  const router = useRouter()

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 12 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              ประวัติการสั่งซื้อ
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <HistoryIcon sx={{ fontSize: 80, color: '#9CA3AF', mb: 3 }} />
          <Typography variant="h5" sx={{ color: '#6B7280', mb: 2, fontWeight: 600 }}>
            ยังไม่มีประวัติการสั่งซื้อ
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF', mb: 4 }}>
            เมื่อคุณสั่งอาหารแล้ว ประวัติจะแสดงที่นี่
          </Typography>
          
          <Card sx={{ maxWidth: 400, margin: '0 auto', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                💡 เคล็ดลับ
              </Typography>
              <Typography variant="body2">
                สั่งอาหารจากร้านโปรดของคุณเพื่อเริ่มสร้างประวัติการสั่งซื้อ 
                และได้รับส่วนลดพิเศษสำหรับลูกค้าประจำ!
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <BottomNavbar />
    </Box>
  )
} 