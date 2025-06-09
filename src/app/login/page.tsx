'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setIsLoggedIn, updateUserData } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const message = searchParams.get('message')
    const error = searchParams.get('error')
    
    if (message === 'registration_success') {
      setSuccessMessage('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
    } else if (message === 'restaurant_registration_success') {
      setSuccessMessage('สมัครร้านอาหารสำเร็จ! กรุณาเข้าสู่ระบบ')
    }
    
    // Handle LINE login errors
    if (error === 'line_auth_failed') {
      setError('การยืนยันตัวตนผ่าน LINE ล้มเหลว กรุณาลองใหม่')
    } else if (error === 'line_token_failed') {
      setError('ไม่สามารถรับ token จาก LINE ได้ กรุณาลองใหม่')
    } else if (error === 'line_profile_failed') {
      setError('ไม่สามารถดึงข้อมูลโปรไฟล์จาก LINE ได้')
    } else if (error === 'line_callback_failed') {
      setError('เกิดข้อผิดพลาดในการประมวลผล LINE login')
    } else if (error === 'line_data_error') {
      setError('ข้อมูลจาก LINE ไม่ถูกต้อง กรุณาลองใหม่')
    } else if (error === 'line_no_data') {
      setError('ไม่พบข้อมูลจาก LINE กรุณาลองใหม่')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // อัพเดทสถานะ login และข้อมูลผู้ใช้จากฐานข้อมูล
        setIsLoggedIn(true)
        updateUserData({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          address: data.user.address,
          latitude: data.user.latitude,
          longitude: data.user.longitude,
          lineUserId: data.user.lineUserId,
          role: data.user.role,
          restaurant: data.user.restaurant
        })
        
        // Redirect based on user role
        if (data.user.role === 'RESTAURANT_OWNER' && data.user.restaurant) {
          router.push('/restaurant/dashboard')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error)
      }

    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLineLogin = () => {
    // สร้าง LINE Login URL
    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ari.treetelu.com'
    const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/line/callback`)
    const state = Math.random().toString(36).substring(2, 15)
    const scope = 'profile%20openid%20email'
    
    // บันทึก state ใน sessionStorage เพื่อตรวจสอบภายหลัง
    sessionStorage.setItem('line_login_state', state)
    
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}&ui_locales=th`
    
    // เปิดหน้าต่าง LINE Login
    window.location.href = lineAuthUrl
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
              เข้าสู่ระบบ
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
            ยินดีต้อนรับกลับ
          </Typography>
          <Typography variant="body1" color="text.secondary">
            เข้าสู่ระบบเพื่อสั่งอาหารออนไลน์
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              {successMessage && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {successMessage}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Email */}
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              {/* Password */}
              <TextField
                fullWidth
                label="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                required
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: '#FFD700',
                  color: '#000',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  mb: 2,
                  '&:hover': {
                    bgcolor: '#FFC107',
                  },
                  '&:disabled': {
                    bgcolor: '#FFD700',
                    opacity: 0.7,
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#000' }} />
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </Button>
            </form>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                หรือ
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            {/* LINE Login Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLineLogin}
              sx={{
                bgcolor: '#00C300',
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#00B300',
                },
                '&:disabled': {
                  bgcolor: '#00C300',
                  opacity: 0.7,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  component="span" 
                  sx={{ 
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  LINE
                </Box>
                <span>เข้าสู่ระบบด้วย LINE</span>
              </Box>
            </Button>
          </CardContent>
        </Card>

        {/* Register Links */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ยังไม่มีบัญชี?
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/register/customer')}
              sx={{
                color: '#1976D2',
                borderColor: '#1976D2',
                fontWeight: 600,
                textTransform: 'none',
                flex: 1,
                maxWidth: 150
              }}
            >
              สมัครลูกค้า
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => router.push('/register/restaurant')}
              sx={{
                color: '#F57C00',
                borderColor: '#F57C00',
                fontWeight: 600,
                textTransform: 'none',
                flex: 1,
                maxWidth: 150
              }}
            >
              สมัครร้านอาหาร
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  )
} 