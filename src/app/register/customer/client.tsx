'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
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
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'

// Schema สำหรับ customer registration
const customerRegisterSchema = z.object({
  name: z.string()
    .min(1, 'กรุณากรอกชื่อ-นามสกุล')
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  
  email: z.string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง'),
  
  phone: z.string()
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์')
    .regex(/^0\d{8,9}$/, 'รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 0812345678)'),
  
  address: z.string()
    .min(1, 'กรุณากรอกที่อยู่')
    .min(10, 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร'),
  
  password: z.string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(50, 'รหัสผ่านต้องไม่เกิน 50 ตัวอักษร'),
  
  confirmPassword: z.string()
    .min(1, 'กรุณายืนยันรหัสผ่าน'),
  
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
}).refine((data) => data.latitude && data.longitude, {
  message: "กรุณาระบุตำแหน่งปัจจุบัน",
  path: ["latitude"],
})

type FormData = z.infer<typeof customerRegisterSchema>

interface LocationState {
  loading: boolean
  error: string | null
  coordinates: { lat: number; lng: number } | null
}

export default function CustomerRegisterClient() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [locationState, setLocationState] = useState<LocationState>({
    loading: false,
    error: null,
    coordinates: null
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
    setError(null)
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationState(prev => ({ ...prev, error: 'เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง' }))
      return
    }

    setLocationState({ loading: true, error: null, coordinates: null })

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // ใช้ OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=th`
          )
          
          if (response.ok) {
            const data = await response.json()
            let address = ''
            
            if (data.address) {
              const parts = []
              if (data.address.house_number) parts.push(data.address.house_number)
              if (data.address.road) parts.push(data.address.road)
              if (data.address.suburb) parts.push(data.address.suburb)
              if (data.address.city_district || data.address.city) parts.push(data.address.city_district || data.address.city)
              if (data.address.state) parts.push(data.address.state)
              if (data.address.postcode) parts.push(data.address.postcode)
              
              address = parts.join(' ')
            }

            setFormData(prev => ({
              ...prev,
              address: address || `ละติจูด ${latitude.toFixed(6)}, ลองติจูด ${longitude.toFixed(6)}`,
              latitude,
              longitude
            }))

            setLocationState({
              loading: false,
              error: null,
              coordinates: { lat: latitude, lng: longitude }
            })
          } else {
            throw new Error('ไม่สามารถค้นหาที่อยู่ได้')
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          // ใช้พิกัดเป็นที่อยู่แทน
          setFormData(prev => ({
            ...prev,
            address: `ละติจูด ${latitude.toFixed(6)}, ลองติจูด ${longitude.toFixed(6)}`,
            latitude,
            longitude
          }))

          setLocationState({
            loading: false,
            error: null,
            coordinates: { lat: latitude, lng: longitude }
          })
        }
      },
      (error) => {
        let errorMessage = 'ไม่สามารถระบุตำแหน่งได้'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'กรุณาอนุญาตการเข้าถึงตำแหน่ง'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'ไม่สามารถระบุตำแหน่งได้'
            break
          case error.TIMEOUT:
            errorMessage = 'หมดเวลาในการระบุตำแหน่ง'
            break
        }

        setLocationState({
          loading: false,
          error: errorMessage,
          coordinates: null
        })
      }
    )
  }

  const validateForm = () => {
    try {
      customerRegisterSchema.parse(formData)
      setErrors({})
      setError(null)
      return true
    } catch (error: any) {
      const formErrors: Record<string, string> = {}
      error.errors?.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          formErrors[err.path[0]] = err.message
        }
      })
      setErrors(formErrors)
      
      // แสดง error ตัวแรกใน general error message
      if (error.errors && error.errors.length > 0) {
        setError(error.errors[0].message)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'CUSTOMER'
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login?message=registration_success')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (success) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm" sx={{ px: 2 }}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>🎉</Typography>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: '#4CAF50' }}>
              สมัครสมาชิกสำเร็จ!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              กำลังนำคุณไปหน้าเข้าสู่ระบบ...
            </Typography>
            <CircularProgress size={30} sx={{ color: '#4CAF50' }} />
          </Card>
        </Container>
      </Box>
    )
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
              สมัครสมาชิกลูกค้า
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        {/* Title */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#E3F2FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2
            }}
          >
            <PersonIcon sx={{ fontSize: 40, color: '#1976D2' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
            สมัครเป็นลูกค้า
          </Typography>
          <Typography variant="body2" color="text.secondary">
            กรอกข้อมูลเพื่อสั่งอาหารออนไลน์
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {locationState.error && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  {locationState.error}
                </Alert>
              )}

              {/* Name */}
              <TextField
                fullWidth
                label="ชื่อ-นามสกุล"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              {/* Email */}
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
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

              {/* Phone */}
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="0812345678"
                error={!!errors.phone}
                helperText={errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              {/* Address with Location Button */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="ที่อยู่สำหรับจัดส่ง"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  placeholder="กรอกที่อยู่หรือใช้ตำแหน่งปัจจุบัน"
                  error={!!errors.address}
                  helperText={errors.address}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <LocationIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  variant={locationState.coordinates ? "contained" : "outlined"}
                  size="small"
                  startIcon={<MyLocationIcon />}
                  onClick={getCurrentLocation}
                  disabled={locationState.loading}
                  sx={{
                    mt: 1,
                    borderColor: locationState.coordinates ? '#4CAF50' : '#4CAF50',
                    color: locationState.coordinates ? 'white' : '#4CAF50',
                    bgcolor: locationState.coordinates ? '#4CAF50' : 'transparent',
                    '&:hover': {
                      borderColor: '#388E3C',
                      bgcolor: locationState.coordinates ? '#388E3C' : 'rgba(76, 175, 80, 0.04)'
                    }
                  }}
                  fullWidth
                >
                  {locationState.loading ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      กำลังระบุตำแหน่ง...
                    </>
                  ) : locationState.coordinates ? (
                    '✓ ตรวจสอบตำแหน่งแล้ว'
                  ) : (
                    'ตรวจสอบตำแหน่งปัจจุบัน (จำเป็น)'
                  )}
                </Button>

                {/* Location Status Alert */}
                {!locationState.coordinates && !locationState.loading && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>⚠️ จำเป็นต้องตรวจสอบตำแหน่ง:</strong> กรุณากดปุ่มด้านบนเพื่อให้ระบบตรวจสอบตำแหน่งปัจจุบันของท่าน เพื่อใช้ในการจัดส่งและแนะนำร้านอาหารใกล้เคียง
                    </Typography>
                  </Alert>
                )}

                {/* Mini Map Display */}
                {locationState.coordinates && (
                  <Card elevation={2} sx={{ mt: 2, overflow: 'hidden', borderRadius: 2 }}>
                    <Box sx={{ 
                      bgcolor: '#4CAF50', 
                      color: 'white', 
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <LocationIcon fontSize="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        ✓ ตำแหน่งปัจจุบันของท่าน
                      </Typography>
                    </Box>
                    
                    <GoogleMapEmbed
                      latitude={locationState.coordinates.lat}
                      longitude={locationState.coordinates.lng}
                      address={formData.address}
                      zoom={16}
                      height={250}
                    />
                  </Card>
                )}
              </Box>

              {/* Password */}
              <TextField
                fullWidth
                label="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                error={!!errors.password}
                helperText={errors.password}
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
                sx={{ mb: 2 }}
                required
              />

              {/* Confirm Password */}
              <TextField
                fullWidth
                label="ยืนยันรหัสผ่าน"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                  'สมัครสมาชิก'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info about LINE */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 3, 
          p: 2, 
          bgcolor: '#E8F5E8', 
          borderRadius: 2, 
          border: '1px solid #C8E6C9' 
        }}>
          <Typography variant="body2" color="success.main" sx={{ fontWeight: 500, mb: 1 }}>
            💡 เคล็ดลับ: สะดวกกว่าด้วย LINE
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ท่านสามารถเข้าสู่ระบบด้วย LINE ได้โดยไม่ต้องสมัครสมาชิก ระบบจะสร้างบัญชีลูกค้าให้อัตโนมัติ
          </Typography>
        </Box>

        {/* Login Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            มีบัญชีแล้ว?
          </Typography>
          <Button
            variant="text"
            onClick={() => router.push('/login')}
            sx={{
              color: '#1976D2',
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            เข้าสู่ระบบ
          </Button>
        </Box>
      </Container>


    </Box>
  )
} 