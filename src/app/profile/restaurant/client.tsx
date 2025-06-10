'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { userProfileSchema, restaurantSchema } from '@/lib/validations'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material'
import BottomNavbar from '@/components/BottomNavbar'
import MiniMap from '@/components/MiniMap'

export default function RestaurantProfileClient() {
  const router = useRouter()
  const { userData, updateUserData, isLoading } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [isEditingRestaurant, setIsEditingRestaurant] = useState(false)
  const [isSavingRestaurant, setIsSavingRestaurant] = useState(false)
  const [userEditData, setUserEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    deliveryTime: '30-45 นาที'
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [userErrors, setUserErrors] = useState<Record<string, string>>({})
  const [restaurantErrors, setRestaurantErrors] = useState<Record<string, string>>({})
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, address?: string} | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Prevent hydration error
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !isLoading && userData) {
      setUserEditData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || ''
      })

      // เซ็ต restaurant data สำหรับเจ้าของร้าน
      if (userData.role === 'RESTAURANT_OWNER' && userData.restaurant) {
        setRestaurantData({
          name: userData.restaurant.name || '',
          description: userData.restaurant.description || '',
          address: userData.restaurant.address || '',
          phone: userData.restaurant.phone || '',
          email: (userData.restaurant as any)?.email || '',
          deliveryTime: userData.restaurant.deliveryTime || '30-45 นาที'
        })
      }
    }
  }, [userData, isMounted, isLoading])

  const validateUserProfile = () => {
    try {
      userProfileSchema.parse(userEditData)
      setUserErrors({})
      return true
    } catch (error: any) {
      const formErrors: Record<string, string> = {}
      error.errors?.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          formErrors[err.path[0]] = err.message
        }
      })
      setUserErrors(formErrors)
      return false
    }
  }

  const validateRestaurant = (dataToValidate = restaurantData) => {
    try {
      restaurantSchema.parse(dataToValidate)
      setRestaurantErrors({})
      return true
    } catch (error: any) {
      const formErrors: Record<string, string> = {}
      error.errors?.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          formErrors[err.path[0]] = err.message
        }
      })
      setRestaurantErrors(formErrors)
      return false
    }
  }

  const handleSaveUser = async () => {
    if (!validateUserProfile()) {
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userData?.id,
          name: userEditData.name,
          email: userEditData.email,
          phone: userEditData.phone,
          address: userEditData.address,
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        updateUserData(updatedUser)
        setIsEditingUser(false)
        setShowSuccess(true)
      } else {
        const errorData = await response.json()
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', errorData.error)
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  const handleCancelUser = () => {
    setUserEditData({
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      address: userData?.address || ''
    })
    setIsEditingUser(false)
  }

  const handleSaveRestaurant = async () => {
    setRestaurantErrors({})
    setUserErrors({})

    // ทำความสะอาดเบอร์โทร
    const cleanedPhone = restaurantData.phone.replace(/[^0-9]/g, '')
    const cleanedData = { ...restaurantData, phone: cleanedPhone }

    if (!validateRestaurant(cleanedData)) {
      return
    }

    setIsSavingRestaurant(true)
    try {
      const response = await fetch('/api/restaurants/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: userData?.restaurant?.id,
          name: cleanedData.name,
          description: cleanedData.description,
          address: cleanedData.address,
          phone: cleanedData.phone,
          email: cleanedData.email,
          deliveryTime: cleanedData.deliveryTime
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        updateUserData(updatedUser)
        setIsEditingRestaurant(false)
        setShowSuccess(true)
      } else {
        const errorData = await response.json()
        setUserErrors({ general: errorData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลร้าน' })
      }
    } catch (error) {
      setUserErrors({ general: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' })
    } finally {
      setIsSavingRestaurant(false)
    }
  }

  const handleCancelRestaurant = () => {
    setRestaurantData({
      name: userData?.restaurant?.name || '',
      description: userData?.restaurant?.description || '',
      address: userData?.restaurant?.address || '',
      phone: userData?.restaurant?.phone || '',
      email: (userData?.restaurant as any)?.email || '',
      deliveryTime: userData?.restaurant?.deliveryTime || '30-45 นาที'
    })
    setIsEditingRestaurant(false)
  }

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true)
    setLocationError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords
      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

      try {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=th,en&addressdetails=1`
        )
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json()
          if (nominatimData.display_name) {
            address = nominatimData.display_name
          }
        }
      } catch {
        console.log('ไม่สามารถแปลงพิกัดเป็นที่อยู่ได้')
      }

      setCurrentLocation({
        lat: latitude,
        lng: longitude,
        address: address
      })

    } catch (error: any) {
      console.error('Geolocation error:', error)
      if (error.code === 1) {
        setLocationError('กรุณาอนุญาตให้เข้าถึงตำแหน่งที่ตั้ง')
      } else if (error.code === 2) {
        setLocationError('ไม่สามารถระบุตำแหน่งได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
      } else if (error.code === 3) {
        setLocationError('หมดเวลาในการระบุตำแหน่ง กรุณาลองใหม่อีกครั้ง')
      } else {
        setLocationError('เกิดข้อผิดพลาดในการระบุตำแหน่ง กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleSaveCurrentLocation = async () => {
    if (!currentLocation) {
      setLocationError('ไม่พบข้อมูลตำแหน่งที่จะบันทึก')
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    try {
      // บันทึกลง restaurant table สำหรับเจ้าของร้าน
      const response = await fetch('/api/restaurants/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: userData?.restaurant?.id,
          name: userData?.restaurant?.name,
          description: userData?.restaurant?.description,
          address: currentLocation.address || userData?.restaurant?.address,
          phone: userData?.restaurant?.phone,
          email: (userData?.restaurant as any)?.email,
          deliveryTime: userData?.restaurant?.deliveryTime,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        updateUserData(updatedUser)
        setShowSuccess(true)
        setCurrentLocation(null)
      } else {
        const errorData = await response.json()
        setLocationError(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกตำแหน่งร้าน')
      }
    } catch (error) {
      setLocationError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsGettingLocation(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ''
    const names = name.trim().split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  // Loading state สำหรับป้องกัน hydration error
  if (isLoading || !isMounted || !userData) {
    return null
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 12 }}>
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              จัดการร้านอาหาร
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: '#FFD700',
              color: '#000000',
              fontSize: '2rem',
              fontWeight: 600,
              margin: '0 auto',
              mb: 2
            }}
          >
            {getInitials(userData.name)}
          </Avatar>

          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            {userData.name || 'ยังไม่ได้ตั้งชื่อ'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            เจ้าของร้านอาหาร
          </Typography>
        </Box>

        {/* ข้อมูลส่วนตัว */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                👤 ข้อมูลส่วนตัว
              </Typography>
              {!isEditingUser && (
                <IconButton onClick={() => setIsEditingUser(true)}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            <TextField
              fullWidth
              label="ชื่อ-นามสกุล"
              value={userEditData.name}
              disabled={!isEditingUser}
              onChange={(e) => setUserEditData(prev => ({ ...prev, name: e.target.value }))}
              error={!!userErrors.name}
              helperText={userErrors.name}
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={userEditData.email}
              disabled={!isEditingUser}
              onChange={(e) => setUserEditData(prev => ({ ...prev, email: e.target.value }))}
              error={!!userErrors.email}
              helperText={userErrors.email}
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              value={userEditData.phone}
              disabled={!isEditingUser}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/[^0-9]/g, '')
                setUserEditData(prev => ({ ...prev, phone: cleanValue }))
              }}
              error={!!userErrors.phone}
              helperText={userErrors.phone || 'เบอร์โทร 10 หลัก เริ่มต้นด้วย 0 (เช่น 0812345678)'}
              size="small"
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              fullWidth
              label="ที่อยู่"
              multiline
              rows={3}
              value={userEditData.address}
              disabled={!isEditingUser}
              onChange={(e) => setUserEditData(prev => ({ ...prev, address: e.target.value }))}
              error={!!userErrors.address}
              helperText={userErrors.address}
              size="small"
              sx={{ mb: 3 }}
            />

            {isEditingUser && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelUser}
                  sx={{ flex: 1 }}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveUser}
                  sx={{
                    flex: 1,
                    bgcolor: '#FFD700',
                    color: '#000000',
                    '&:hover': { bgcolor: '#FFC107' }
                  }}
                >
                  บันทึก
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* ข้อมูลร้านอาหาร */}
        <Card sx={{ borderRadius: 3, mb: 3, border: '2px solid #FFD700', bgcolor: 'linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#D97706' }}>
                🏪 ข้อมูลร้านอาหาร
              </Typography>
              {userData.restaurant && !isEditingRestaurant && (
                <IconButton 
                  onClick={() => setIsEditingRestaurant(true)}
                  sx={{
                    color: '#D97706',
                    bgcolor: '#FEF3C7',
                    '&:hover': { bgcolor: '#FDE047' }
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>

            {userData.restaurant ? (
              <Box>
                {!isEditingRestaurant ? (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #F3F4F6' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                      {userData.restaurant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {userData.restaurant.description || 'ไม่มีคำอธิบาย'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip size="small" label={`📍 ${userData.restaurant.address}`} />
                      {userData.restaurant.phone && (
                        <Chip size="small" label={`📞 ${userData.restaurant.phone}`} />
                      )}
                      {userData.restaurant.deliveryTime && (
                        <Chip size="small" label={`🕒 ${userData.restaurant.deliveryTime}`} />
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="ชื่อร้าน"
                      value={restaurantData.name}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                      error={!!restaurantErrors.name}
                      helperText={restaurantErrors.name}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="คำอธิบายร้าน"
                      value={restaurantData.description}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, description: e.target.value }))}
                      error={!!restaurantErrors.description}
                      helperText={restaurantErrors.description}
                      multiline
                      rows={2}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="ที่อยู่ร้าน"
                      value={restaurantData.address}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                      error={!!restaurantErrors.address}
                      helperText={restaurantErrors.address}
                      multiline
                      rows={2}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="เบอร์โทรร้าน"
                      value={restaurantData.phone}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/[^0-9]/g, '')
                        setRestaurantData(prev => ({ ...prev, phone: cleanValue }))
                      }}
                      error={!!restaurantErrors.phone}
                      helperText={restaurantErrors.phone || 'เบอร์โทร 10 หลัก เริ่มต้นด้วย 0 (เช่น 0812345678)'}
                      size="small"
                      sx={{ mb: 2 }}
                      inputProps={{ maxLength: 10 }}
                    />
                    <TextField
                      fullWidth
                      label="อีเมลร้าน"
                      value={restaurantData.email}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, email: e.target.value }))}
                      error={!!restaurantErrors.email}
                      helperText={restaurantErrors.email || 'อีเมลร้าน (ไม่บังคับ)'}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="เวลาส่งอาหาร"
                      value={restaurantData.deliveryTime}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                      error={!!restaurantErrors.deliveryTime}
                      helperText={restaurantErrors.deliveryTime || 'เช่น 30-45 นาที'}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    {userErrors.general && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {userErrors.general}
                      </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancelRestaurant}
                        disabled={isSavingRestaurant}
                        sx={{
                          borderColor: '#E5E7EB',
                          color: '#6B7280'
                        }}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSaveRestaurant}
                        disabled={isSavingRestaurant}
                        sx={{
                          bgcolor: '#FFD700',
                          color: '#000',
                          fontWeight: 600,
                          '&:hover': { bgcolor: '#FFC107' }
                        }}
                      >
                        {isSavingRestaurant ? 'กำลังบันทึก...' : 'บันทึก'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {!isEditingRestaurant && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/restaurant/dashboard')}
                      sx={{
                        bgcolor: '#FFD700',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#FFC107' }
                      }}
                    >
                      จัดการร้าน
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => router.push(`/restaurant/${userData.restaurant?.id}/products`)}
                      sx={{
                        borderColor: '#FFD700',
                        color: '#D97706',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#FFC107',
                          backgroundColor: 'rgba(255, 215, 0, 0.04)'
                        }
                      }}
                    >
                      จัดการเมนู
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  ยังไม่พบข้อมูลร้านอาหาร
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/restaurant/dashboard')}
                  sx={{
                    bgcolor: '#FFD700',
                    color: '#000',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#FFC107' }
                  }}
                >
                  ตั้งค่าร้านอาหาร
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* ตำแหน่งร้านอาหาร */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                📍 ที่อยู่ร้านอาหาร
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={isGettingLocation ? <CircularProgress size={14} /> : <MyLocationIcon />}
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                sx={{
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.5,
                  borderColor: '#FFD700',
                  color: '#D97706',
                  '&:hover': {
                    borderColor: '#FFC107',
                    backgroundColor: 'rgba(255, 215, 0, 0.04)'
                  }
                }}
              >
                {isGettingLocation ? 'กำลังดึง...' : 'ดึงตำแหน่ง'}
              </Button>
            </Box>

            {/* แสดงตำแหน่งใหม่ที่ดึงมาพร้อมแผนที่ preview */}
            {currentLocation && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    🎯 ตำแหน่งใหม่ที่ตรวจพบ:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {currentLocation.address}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    พิกัด: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </Typography>
                </Alert>

                {/* Preview แผนที่ตำแหน่งใหม่ */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    ตัวอย่างแผนที่:
                  </Typography>
                  <MiniMap 
                    lat={currentLocation.lat}
                    lng={currentLocation.lng}
                    address={currentLocation.address}
                    height="200px"
                  />
                </Box>

                {/* ปุ่มบันทึกตำแหน่งใหม่ */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentLocation(null)}
                    sx={{ flex: 1 }}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isGettingLocation ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSaveCurrentLocation}
                    disabled={isGettingLocation}
                    sx={{
                      flex: 1,
                      bgcolor: '#4CAF50',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#45A049' }
                    }}
                  >
                    {isGettingLocation ? 'กำลังบันทึก...' : 'บันทึกตำแหน่งนี้'}
                  </Button>
                </Box>
              </Box>
            )}

            {locationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>ไม่สามารถดึงตำแหน่งได้:</strong><br />
                  {locationError}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    💡 <strong>คำแนะนำ:</strong> ตรวจสอบการตั้งค่าตำแหน่งในเบราว์เซอร์ และอนุญาตให้เว็บไซต์เข้าถึงตำแหน่งของคุณ
                  </Typography>
                </Box>
              </Alert>
            )}

          </CardContent>
        </Card>

        {/* Snackbar สำหรับแสดงผลสำเร็จ */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setShowSuccess(false)}>
            บันทึกข้อมูลสำเร็จ!
          </Alert>
        </Snackbar>
      </Container>

      <BottomNavbar />
    </Box>
  )
} 