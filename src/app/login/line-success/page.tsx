'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'

export default function LineSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setIsLoggedIn, updateUserData } = useUser()
  const processedRef = useRef(false)

  useEffect(() => {
    // ป้องกัน multiple executions
    if (processedRef.current) return
    
    const userParam = searchParams.get('user')
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam))
        
        // อัพเดทสถานะ login และข้อมูลผู้ใช้
        setIsLoggedIn(true)
        updateUserData({
          ...userData,
          lineUserId: userData.lineUserId // ให้แน่ใจว่า lineUserId ถูกส่งไปยัง context
        })
        
        // บังคับบันทึก localStorage ทันที
        localStorage.setItem('user_logged_in', 'true')
        localStorage.setItem('user_profile', JSON.stringify({
          ...userData,
          lineUserId: userData.lineUserId
        }))
        
        // Mark as processed
        processedRef.current = true
        
        // Redirect ไปหน้าหลัก (LINE users จะเป็น CUSTOMER เสมอ)
        setTimeout(() => {
          window.location.href = '/' // ใช้ window.location.href แทน router.push เพื่อบังคับ refresh
        }, 1500)
        
      } catch (error) {
        console.error('Error parsing user data:', error)
        processedRef.current = true
        router.push('/login?error=line_data_error')
      }
    } else {
      processedRef.current = true
      router.push('/login?error=line_no_data')
    }
  }, [searchParams, setIsLoggedIn, updateUserData, router]) // ใส่ dependencies กลับคืน

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <Container maxWidth="sm" sx={{ px: 2, py: 8 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <CircularProgress 
                size={60} 
                sx={{ 
                  color: '#00C300',
                  mb: 2 
                }} 
              />
            </Box>
            
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: '#00C300' }}>
              🎉 เข้าสู่ระบบสำเร็จ!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              ยินดีต้อนรับสู่ AriFood
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              กำลังนำท่านไปยังหน้าหลัก...
            </Typography>

            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: '#E8F5E8', 
              borderRadius: 2,
              border: '1px solid #C8E6C9'
            }}>
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                ✅ เข้าสู่ระบบด้วย LINE สำเร็จ
              </Typography>
              <Typography variant="caption" color="text.secondary">
                บัญชีของท่านได้รับการตั้งค่าเป็นลูกค้าโดยอัตโนมัติ
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
} 