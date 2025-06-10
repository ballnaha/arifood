'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Container } from '@mui/material'

export default function AdminProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect ไปหน้า admin dashboard
    router.push('/admin')
  }, [router])

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
        <CircularProgress size={50} sx={{ color: '#FF5722' }} />
        <Box sx={{ mt: 2, color: 'text.secondary' }}>
          กำลังเปลี่ยนเส้นทางไปหน้าผู้ดูแล...
        </Box>
      </Container>
    </Box>
  )
} 