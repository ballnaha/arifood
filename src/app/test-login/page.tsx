'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
  Chip
} from '@mui/material'

export default function TestLoginPage() {
  const router = useRouter()
  const { userData, login, logout } = useUser()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleMockLogin = async (role: string) => {
    let email = ''
    let password = 'password'

    switch (role) {
      case 'ADMIN':
        email = 'admin@arifood.com'
        break
      case 'CUSTOMER':
        email = 'customer@example.com'
        break
      case 'RESTAURANT_OWNER':
        email = 'restaurant@example.com'
        break
      case 'RIDER':
        email = 'rider@example.com'
        break
    }

    try {
      // ใช้ UserContext login method
      const success = await login(email, password)
      
      if (success) {
        setMessage({ type: 'success', text: `เข้าสู่ระบบสำเร็จในฐานะ ${role}` })
      } else {
        setMessage({ type: 'error', text: 'ไม่สามารถเข้าสู่ระบบได้' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
    }
  }

  const handleLogout = () => {
    logout()
    setMessage({ type: 'success', text: 'ออกจากระบบสำเร็จ' })
  }

  const checkCurrentToken = () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      setMessage({ type: 'success', text: `Token ปัจจุบัน: ${token}` })
    } else {
      setMessage({ type: 'error', text: 'ไม่พบ token ในระบบ' })
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        🧪 หน้าทดสอบ Login
      </Typography>

      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)} 
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      {/* แสดงสถานะปัจจุบัน */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            สถานะปัจจุบัน
          </Typography>
          {userData ? (
            <Box>
              <Typography variant="body1">
                <strong>ชื่อ:</strong> {userData.name}
              </Typography>
              <Typography variant="body1">
                <strong>อีเมล:</strong> {userData.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>บทบาท:</strong> 
                <Chip 
                  label={userData.role} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleLogout}
                fullWidth
              >
                ออกจากระบบ
              </Button>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              ยังไม่ได้เข้าสู่ระบบ
            </Typography>
          )}
        </CardContent>
      </Card>

             {/* ปุ่มทดสอบ login */}
       <Card sx={{ mb: 3 }}>
         <CardContent>
           <Typography variant="h6" gutterBottom>
             เข้าสู่ระบบด้วย Mock Accounts
           </Typography>
           
           <Alert severity="info" sx={{ mb: 2 }}>
             <Typography variant="caption">
               <strong>รหัสผ่านทุกบัญชี:</strong> password
             </Typography>
           </Alert>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                         <Button 
               variant="contained" 
               color="error"
               onClick={() => handleMockLogin('ADMIN')}
               fullWidth
               sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
             >
               <Box>
                 <Typography variant="button">🛡️ Admin (ผู้ดูแลระบบ)</Typography>
                 <Typography variant="caption" display="block">admin@arifood.com</Typography>
               </Box>
             </Button>
             
             <Button 
               variant="contained" 
               color="primary"
               onClick={() => handleMockLogin('CUSTOMER')}
               fullWidth
               sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
             >
               <Box>
                 <Typography variant="button">👤 Customer (ลูกค้า)</Typography>
                 <Typography variant="caption" display="block">customer@example.com</Typography>
               </Box>
             </Button>
             
             <Button 
               variant="contained" 
               color="warning"
               onClick={() => handleMockLogin('RESTAURANT_OWNER')}
               fullWidth
               sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
             >
               <Box>
                 <Typography variant="button">🏪 Restaurant Owner (เจ้าของร้าน)</Typography>
                 <Typography variant="caption" display="block">restaurant@example.com</Typography>
               </Box>
             </Button>
             
             <Button 
               variant="contained" 
               color="info"
               onClick={() => handleMockLogin('RIDER')}
               fullWidth
               sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
             >
               <Box>
                 <Typography variant="button">🛵 Rider (ไรเดอร์)</Typography>
                 <Typography variant="caption" display="block">rider@example.com</Typography>
               </Box>
             </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ปุ่มเครื่องมือ debug */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            เครื่องมือ Debug
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={checkCurrentToken}
              fullWidth
            >
              ตรวจสอบ Token ปัจจุบัน
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => router.push('/profile')}
              fullWidth
            >
              ไปหน้า Profile
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => router.push('/admin')}
              fullWidth
            >
              ไปหน้า Admin
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
} 