'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Stack
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material'

export default function RegisterPage() {
  const router = useRouter()

  const handleSelectCustomer = () => {
    router.push('/register/customer')
  }

  const handleSelectRestaurant = () => {
    router.push('/register/restaurant')
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              สมัครสมาชิก
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 4 }}>
        {/* Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2, color: '#FFD700' }}>
            🍜 AriFood
          </Typography>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
            เลือกประเภทการสมัคร
          </Typography>
          <Typography variant="body1" color="text.secondary">
            คุณต้องการสมัครเป็นอะไร?
          </Typography>
        </Box>

        {/* Registration Options */}
        <Stack spacing={3}>
          {/* Customer Registration */}
          <Card 
            sx={{ 
              borderRadius: 3, 
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }
            }}
            onClick={handleSelectCustomer}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#E3F2FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 30, color: '#1976D2' }} />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                    ลูกค้า
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    สมัครเพื่อสั่งอาหารจากร้านต่างๆ
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    ✓ สั่งอาหารออนไลน์ ✓ ติดตามสถานะ ✓ รีวิวร้าน
                  </Typography>
                </Box>
                
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </Box>
            </CardContent>
          </Card>

          {/* Restaurant Owner Registration */}
          <Card 
            sx={{ 
              borderRadius: 3, 
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }
            }}
            onClick={handleSelectRestaurant}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: '#FFF3E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <StoreIcon sx={{ fontSize: 30, color: '#F57C00' }} />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                    เจ้าของร้านอาหาร
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    สมัครเพื่อขายอาหารออนไลน์
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#FF9800', fontWeight: 600 }}>
                    ✓ จัดการร้าน ✓ เพิ่มเมนูอาหาร ✓ รับออเดอร์
                  </Typography>
                </Box>
                
                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Already have account */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            มีบัญชีแล้ว?
          </Typography>
          <Button
            variant="text"
            onClick={() => router.push('/login')}
            sx={{
              color: '#FFD700',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            เข้าสู่ระบบ
          </Button>
        </Box>
      </Container>
    </Box>
  )
} 