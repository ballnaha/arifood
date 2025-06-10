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
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'

interface FormData {
  ownerName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  restaurantName: string
  description: string
  address: string
  latitude?: number
  longitude?: number
  deliveryTime: string
}

interface LocationState {
  loading: boolean
  error: string | null
  coordinates: { lat: number; lng: number } | null
}

export default function RestaurantRegisterClient() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    description: '',
    address: '',
    deliveryTime: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [locationState, setLocationState] = useState<LocationState>({
    loading: false,
    error: null,
    coordinates: null
  })

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
    if (!formData.ownerName || !formData.email || !formData.phone || !formData.password) {
      setError('กรุณากรอกข้อมูลเจ้าของร้านให้ครบถ้วน')
      return false
    }

    if (!formData.restaurantName || !formData.address) {
      setError('กรุณากรอกข้อมูลร้านอาหารให้ครบถ้วน')
      return false
    }

    if (!formData.latitude || !formData.longitude) {
      setError('กรุณาตรวจสอบตำแหน่งร้านอาหารก่อนสมัครสมาชิก')
      return false
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return false
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง')
      return false
    }

    if (!/^0\d{8,9}$/.test(formData.phone)) {
      setError('รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 0812345678)')
      return false
    }

    return true
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
          name: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          latitude: formData.latitude,
          longitude: formData.longitude,
          role: 'RESTAURANT_OWNER',
          restaurant: {
            name: formData.restaurantName,
            description: formData.description,
            address: formData.address,
            deliveryTime: formData.deliveryTime || '30-45 นาที'
          }
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login?message=restaurant_registration_success')
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

  if (success) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm" sx={{ px: 2 }}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>🏪</Typography>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: '#FF9800' }}>
              สมัครร้านอาหารสำเร็จ!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              กำลังนำคุณไปหน้าเข้าสู่ระบบ...
            </Typography>
            <CircularProgress size={30} sx={{ color: '#FF9800' }} />
          </Card>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              สมัครร้านอาหาร
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#FFF3E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2
            }}
          >
            <StoreIcon sx={{ fontSize: 40, color: '#F57C00' }} />
          </Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
            เปิดร้านขายอาหาร
          </Typography>
          <Typography variant="body2" color="text.secondary">
            เริ่มต้นธุรกิจอาหารออนไลน์ของคุณ
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

              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#1976D2' }}>
                👤 ข้อมูลเจ้าของร้าน
              </Typography>

              <TextField
                fullWidth
                label="ชื่อ-นามสกุล เจ้าของร้าน"
                value={formData.ownerName}
                onChange={handleInputChange('ownerName')}
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

              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
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

              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="0812345678"
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

              <TextField
                fullWidth
                label="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
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

              <TextField
                fullWidth
                label="ยืนยันรหัสผ่าน"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
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

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#F57C00' }}>
                🏪 ข้อมูลร้านอาหาร
              </Typography>

              <TextField
                fullWidth
                label="ชื่อร้านอาหาร"
                value={formData.restaurantName}
                onChange={handleInputChange('restaurantName')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="คำอธิบายร้าน (ไม่บังคับ)"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="เช่น ร้านอาหารไทยแท้ รสชาติต้นตำรับ..."
                sx={{ mb: 2 }}
              />

              {/* Address with Location Button */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="ที่อยู่ร้าน"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  placeholder="กรอกที่อยู่ร้านหรือใช้ตำแหน่งปัจจุบัน"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <LocationIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                
                <Button
                  variant={locationState.coordinates ? "contained" : "outlined"}
                  size="small"
                  startIcon={<MyLocationIcon />}
                  onClick={getCurrentLocation}
                  disabled={locationState.loading}
                  sx={{
                    mt: 1,
                    borderColor: locationState.coordinates ? '#FF9800' : '#FF9800',
                    color: locationState.coordinates ? 'white' : '#FF9800',
                    bgcolor: locationState.coordinates ? '#FF9800' : 'transparent',
                    '&:hover': {
                      borderColor: '#F57C00',
                      bgcolor: locationState.coordinates ? '#F57C00' : 'rgba(255, 152, 0, 0.04)'
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
                    'ตรวจสอบตำแหน่งร้าน (จำเป็น)'
                  )}
                </Button>

                {/* Location Status Alert */}
                {!locationState.coordinates && !locationState.loading && (
                  <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>⚠️ จำเป็นต้องตรวจสอบตำแหน่ง:</strong> กรุณากดปุ่มด้านบนเพื่อให้ระบบตรวจสอบตำแหน่งร้านอาหารของท่าน เพื่อใช้ในระบบจัดส่งและให้ลูกค้าค้นหาร้านได้
                    </Typography>
                  </Alert>
                )}

                {/* Mini Map Display */}
                {locationState.coordinates && (
                  <Card elevation={2} sx={{ mt: 2, overflow: 'hidden', borderRadius: 2 }}>
                    <Box sx={{ 
                      bgcolor: '#FF9800', 
                      color: 'white', 
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <LocationIcon fontSize="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        ✓ ตำแหน่งร้านอาหารของท่าน
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

              <TextField
                fullWidth
                label="เวลาในการจัดส่ง (ไม่บังคับ)"
                value={formData.deliveryTime}
                onChange={handleInputChange('deliveryTime')}
                placeholder="เช่น 30-45 นาที"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: '#FF9800',
                  color: '#fff',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#F57C00',
                  },
                  '&:disabled': {
                    bgcolor: '#FF9800',
                    opacity: 0.7,
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  'สมัครร้านอาหาร'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            มีบัญชีแล้ว?
          </Typography>
          <Button
            variant="text"
            onClick={() => router.push('/login')}
            sx={{
              color: '#F57C00',
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
