'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { userProfileSchema } from '@/lib/validations'
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
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material'
import BottomNavbar from '@/components/BottomNavbar'
import MiniMap from '@/components/MiniMap'

export default function CustomerProfileClient() {
  const router = useRouter()
  const { userData, updateUserData, isLoading } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, address?: string} | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Prevent hydration error
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && !isLoading && userData) {
      setEditData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || ''
      })
    }
  }, [userData, isMounted, isLoading])

  const validateUserProfile = () => {
    try {
      userProfileSchema.parse(editData)
      setErrors({})
      return true
    } catch (error: any) {
      const formErrors: Record<string, string> = {}
      error.errors?.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          formErrors[err.path[0]] = err.message
        }
      })
      setErrors(formErrors)
      return false
    }
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const handleSave = async () => {
    if (!validateUserProfile()) {
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone: editData.phone,
          address: editData.address,
        })
      })

      if (response.ok) {
        const result = await response.json()
        updateUserData(result.user)
        setIsEditing(false)
        setShowSuccess(true)
      } else {
        const errorData = await response.json()
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', errorData.error)
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      address: userData?.address || ''
    })
    setIsEditing(false)
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
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: userData?.name,
          email: userData?.email,
          phone: userData?.phone,
          address: currentLocation.address,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      })

      if (response.ok) {
        const result = await response.json()
        updateUserData(result.user)
        setEditData(prev => ({ ...prev, address: currentLocation.address || '' }))
        setShowSuccess(true)
        setCurrentLocation(null)
      } else {
        const errorData = await response.json()
        setLocationError(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกตำแหน่ง')
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
              ข้อมูลส่วนตัว
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
            ลูกค้า
          </Typography>
        </Box>

        {/* ข้อมูลส่วนตัว */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              👤 ข้อมูลส่วนตัว
            </Typography>
            
            <TextField
              fullWidth
              label="ชื่อ-นามสกุล"
              value={editData.name}
              disabled={!isEditing}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={editData.email}
              disabled={!isEditing}
              onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
              error={!!errors.email}
              helperText={errors.email}
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              value={editData.phone}
              disabled={!isEditing}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/[^0-9]/g, '')
                setEditData(prev => ({ ...prev, phone: cleanValue }))
              }}
              error={!!errors.phone}
              helperText={errors.phone || 'เบอร์โทร 10 หลัก เริ่มต้นด้วย 0 (เช่น 0812345678)'}
              size="small"
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              fullWidth
              label="ที่อยู่"
              multiline
              rows={3}
              value={editData.address}
              disabled={!isEditing}
              onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
              error={!!errors.address}
              helperText={errors.address}
              size="small"
              sx={{ mb: 3 }}
            />

            {!isEditing ? (
              <Button
                fullWidth
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{
                  bgcolor: '#FFD700',
                  color: '#000000',
                  '&:hover': { bgcolor: '#FFC107' }
                }}
              >
                แก้ไขข้อมูล
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{ flex: 1 }}
                >
                  ยกเลิก
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
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

        {/* ตำแหน่งปัจจุบัน */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                📍 ตำแหน่งปัจจุบัน
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
