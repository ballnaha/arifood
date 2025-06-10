'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Box, CircularProgress, Container } from '@mui/material'

export default function ProfilePage() {
  const router = useRouter()
  const { userData, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading) {
      if (!userData) {
        // ถ้าไม่มีข้อมูล user ให้ไปหน้า login
        router.push('/login')
        return
      }

      // Redirect ตาม role
      switch (userData.role) {
        case 'CUSTOMER':
          router.push('/profile/customer')
          break
        case 'RESTAURANT_OWNER':
          router.push('/profile/restaurant')
          break
        case 'RIDER':
          router.push('/profile/rider')
          break
        case 'ADMIN':
          router.push('/admin')
          break
        default:
          // Default เป็น customer
          router.push('/profile/customer')
          break
      }
    }
  }, [userData, isLoading, router])

  // แสดง loading ขณะ redirect
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#FAFAFA'
    }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <CircularProgress size={50} sx={{ color: '#FFD700' }} />
        <Box sx={{ mt: 2, color: 'text.secondary' }}>
          กำลังเปลี่ยนเส้นทาง...
        </Box>
      </Container>
    </Box>
  )
} 