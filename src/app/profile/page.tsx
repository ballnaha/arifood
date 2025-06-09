'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
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
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MyLocation as MyLocationIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material'
import BottomNavbar from '@/components/BottomNavbar'
import MiniMap from '@/components/MiniMap'
import GoogleMapEmbed from '@/components/GoogleMapEmbed'

export default function ProfilePage() {
  const router = useRouter()
  const { userData, updateUserData, isDataLoaded } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(userData)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, address?: string} | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  
  // Avatar upload states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  useEffect(() => {
    setEditData(userData)
  }, [userData])

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userData.id,
          name: userData.lineUserId ? userData.name : editData.name, // ถ้าเป็นผู้ใช้ LINE ใช้ชื่อเดิม
          email: userData.lineUserId ? userData.email : editData.email, // ถ้าเป็นผู้ใช้ LINE ใช้ email เดิม
          phone: editData.phone,
          address: editData.address,
          latitude: editData.latitude,
          longitude: editData.longitude
        })
      })

      if (response.ok) {
        const result = await response.json()
        updateUserData(result.user)
        setIsEditing(false)
        setShowSuccess(true)
        console.log('บันทึกข้อมูลสำเร็จ:', result)
      } else {
        const errorData = await response.json()
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', errorData.error)
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  const handleCancel = () => {
    setEditData(userData)
    setIsEditing(false)
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: currentLocation.address,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng
        })
      })

      if (response.ok) {
        const result = await response.json()
        updateUserData(result.user)
        setEditData(result.user)
        setShowSuccess(true)
        
        // ซ่อน current location map หลังบันทึกสำเร็จ
        setCurrentLocation(null)
        
        console.log('บันทึกตำแหน่งสำเร็จ:', result)
      } else {
        const errorData = await response.json()
        setLocationError(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกตำแหน่ง')
        console.error('เกิดข้อผิดพลาดในการบันทึกตำแหน่ง:', errorData.error)
      }
    } catch (error) {
      console.error('Network error:', error)
      setLocationError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError(null)

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userData.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setIsChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowSuccess(true)
        console.log('เปลี่ยนรหัสผ่านสำเร็จ')
      } else {
        const errorData = await response.json()
        setPasswordError(errorData.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
      }
    } catch (error) {
      console.error('Network error:', error)
      setPasswordError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError(null)
  }

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true)
    setLocationError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        )
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude

      // แสดงตำแหน่งพิกัดก่อน
      setCurrentLocation({ 
        lat, 
        lng, 
        address: 'กำลังค้นหาที่อยู่...' 
      })

      try {
        // ใช้ reverse geocoding จริง
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=th`
        )
        
        if (response.ok) {
          const data = await response.json()
          
          // สร้างที่อยู่ที่อ่านง่าย
          let formattedAddress = ''
          if (data.address) {
            const addr = data.address
            const parts = []
            
            // เลขที่บ้าน
            if (addr.house_number) parts.push(addr.house_number)
            
            // ถนน
            if (addr.road) parts.push(`ถนน${addr.road}`)
            else if (addr.street) parts.push(addr.street)
            
            // ตำบล/แขวง
            if (addr.suburb) parts.push(`แขวง${addr.suburb}`)
            else if (addr.village) parts.push(`ตำบล${addr.village}`)
            
            // เขต/อำเภอ
            if (addr.city_district) parts.push(`เขต${addr.city_district}`)
            else if (addr.county) parts.push(`อำเภอ${addr.county}`)
            
            // จังหวัด
            if (addr.state) parts.push(addr.state)
            
            // รหัสไปรษณีย์
            if (addr.postcode) parts.push(addr.postcode)
            
            formattedAddress = parts.join(' ') || data.display_name
          } else {
            formattedAddress = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          }
          
          setCurrentLocation({ lat, lng, address: formattedAddress })
          
          // บันทึก lat/lng ลงใน editData
          setEditData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }))
        } else {
          throw new Error('ไม่สามารถหาที่อยู่ได้')
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed, using coordinates:', geocodeError)
        // ใช้พิกัดเป็นที่อยู่หากไม่สามารถหาที่อยู่ได้
        setCurrentLocation({ 
          lat, 
          lng, 
          address: `พิกัด: ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
        })
        
        // บันทึก lat/lng ลงใน editData
        setEditData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }))
      }

    } catch (error: any) {
      console.error('Error getting location:', error)
      let errorMessage = 'ไม่สามารถระบุตำแหน่งได้'
      
      if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = 'ผู้ใช้ปฏิเสธการเข้าถึงตำแหน่ง'
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = 'ไม่สามารถระบุตำแหน่งได้'
      } else if (error.code === 3) { // TIMEOUT
        errorMessage = 'หมดเวลาในการค้นหาตำแหน่ง'
      }
      
      setLocationError(errorMessage)
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userData.id) return

    setAvatarError(null)
    setUploadProgress(null)

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('ประเภทไฟล์ไม่ถูกต้อง กรุณาใช้ JPG, PNG หรือ WebP')
      // Reset input file
      event.target.value = ''
      return
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 15MB)
    const maxSize = 15 * 1024 * 1024 // 15MB in bytes
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setAvatarError(`ไฟล์รูปภาพขนาด ${fileSizeMB}MB เกินขีดจำกัด 15MB`)
      // Reset input file
      event.target.value = ''
      return
    }

    setIsUploadingAvatar(true)
    setUploadProgress('กำลังเตรียมไฟล์...')

    try {
      const formData = new FormData()
      formData.append('avatar', file)
      formData.append('userId', userData.id)

      setUploadProgress('กำลังอัพโหลดและประมวลผลรูปภาพ...')
      
      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadProgress('อัพโหลดสำเร็จ!')
        updateUserData(result.user)
        setShowSuccess(true)
        // Reset input file after successful upload
        event.target.value = ''
        setTimeout(() => setUploadProgress(null), 2000)
      } else {
        setAvatarError(result.error || 'เกิดข้อผิดพลาดในการอัพโหลดรูป')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      setAvatarError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsUploadingAvatar(false)
      if (!uploadProgress?.includes('สำเร็จ')) {
        setUploadProgress(null)
      }
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const names = name.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  // แสดง Loading หากข้อมูลยังไม่โหลดเสร็จ
  if (!isDataLoaded) {
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
          {/* Avatar Section Loading */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Skeleton 
              variant="circular" 
              width={100} 
              height={100} 
              sx={{ margin: '0 auto', mb: 2 }} 
            />
            <Skeleton variant="text" width={200} height={32} sx={{ margin: '0 auto', mb: 1 }} />
            <Skeleton variant="text" width={100} height={20} sx={{ margin: '0 auto' }} />
          </Box>

          {/* Profile Card Loading */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width={120} height={28} sx={{ mb: 3 }} />
              
              {/* Name Field */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width={80} height={20} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ ml: 3.5, borderRadius: 1 }} />
              </Box>

              {/* Email Field */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width={60} height={20} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ ml: 3.5, borderRadius: 1 }} />
              </Box>

              {/* Phone Field */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width={100} height={20} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ ml: 3.5, borderRadius: 1 }} />
              </Box>

              {/* Address Field */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width={80} height={20} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={96} sx={{ ml: 3.5, borderRadius: 1 }} />
              </Box>
            </CardContent>
          </Card>

          {/* Location Card Loading */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
            </CardContent>
          </Card>

          {/* Loading Center */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: '#FFD700', mr: 2 }} />
            <Typography variant="body1" color="text.secondary">
              กำลังโหลดข้อมูล...
            </Typography>
          </Box>
        </Container>
      </Box>
    )
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
            {!isEditing && (
              <IconButton 
                onClick={() => setIsEditing(true)}
                sx={{
                  color: '#FFD700'
                }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              src={userData.avatar}
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#FFD700',
                color: '#000000',
                fontSize: '2rem',
                fontWeight: 600,
              }}
            >
              {!userData.avatar && getInitials(userData.name)}
            </Avatar>
            
            {/* Upload Button */}
            <IconButton
              component="label"
              disabled={isUploadingAvatar}
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                bgcolor: '#FFFFFF',
                border: '1px solid #FFD700',
                color: '#000',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: '#FFC000' },
                boxShadow: 2
              }}
            >
              {isUploadingAvatar ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PhotoCameraIcon sx={{ fontSize: 16 }} />
              )}
              <input
                type="file"
                hidden
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
              />
            </IconButton>
          </Box>
          
          {avatarError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
              {avatarError}
            </Typography>
          )}

          {uploadProgress && (
            <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
              {uploadProgress}
            </Typography>
          )}
          
          <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
            {userData.name || 'ยังไม่ได้ตั้งชื่อ'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            สมาชิกธรรมดา
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              ข้อมูลส่วนตัว
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" fontWeight={600}>
                  ชื่อ-นามสกุล
                </Typography>
              </Box>
              {isEditing ? (
                <Box sx={{ ml: 3.5 }}>
                  <TextField
                    fullWidth
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="กรอกชื่อ-นามสกุล"
                    size="small"
                    variant="outlined"
                    disabled={!!userData.lineUserId}
                    helperText={userData.lineUserId ? 'ชื่อจาก LINE ไม่สามารถแก้ไขได้' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body1" sx={{ ml: 3.5, color: userData.name ? 'text.primary' : 'text.secondary' }}>
                  {userData.name || 'ยังไม่ได้กรอกข้อมูล'}
                </Typography>
              )}
            </Box>

            {/* แสดงส่วนอีเมลเฉพาะผู้ใช้ที่ไม่ได้ login ด้วย LINE */}
            {!userData.lineUserId && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" fontWeight={600}>
                    อีเมล
                  </Typography>
                </Box>
                {isEditing ? (
                  <Box sx={{ ml: 3.5 }}>
                    <TextField
                      fullWidth
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="กรอกอีเมล เช่น example@email.com"
                      size="small"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ ml: 3.5, color: userData.email ? 'text.primary' : 'text.secondary' }}>
                    {userData.email || 'ยังไม่ได้กรอกข้อมูล'}
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" fontWeight={600}>
                  เบอร์โทรศัพท์
                </Typography>
              </Box>
              {isEditing ? (
                <Box sx={{ ml: 3.5 }}>
                  <TextField
                    fullWidth
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="กรอกเบอร์โทรศัพท์"
                    size="small"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body1" sx={{ ml: 3.5, color: userData.phone ? 'text.primary' : 'text.secondary' }}>
                  {userData.phone || 'ยังไม่ได้กรอกข้อมูล'}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" fontWeight={600}>
                  ที่อยู่จัดส่ง
                </Typography>
              </Box>
              {isEditing ? (
                <Box sx={{ ml: 3.5 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editData.address}
                    onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="กรอกที่อยู่จัดส่ง เช่น 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                    size="small"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ ml: 3.5 }}>
                  <Typography variant="body1" sx={{ color: userData.address ? 'text.primary' : 'text.secondary', mb: 1 }}>
                    {userData.address || 'ยังไม่ได้กรอกข้อมูล'}
                  </Typography>
                  
                  {/* แสดง mini map หากมีพิกัด */}
                  {userData.latitude && userData.longitude && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        📍 ตำแหน่งที่บันทึกไว้
                      </Typography>
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 2 }}>
                        หมุดสีแดงแสดงที่อยู่จัดส่งหลักของคุณ
                      </Typography>
                      <GoogleMapEmbed
                        latitude={userData.latitude}
                        longitude={userData.longitude}
                        address={userData.address}
                        height={120}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {isEditing && (
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{
                    borderColor: '#E5E7EB',
                    color: '#6B7280'
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    bgcolor: '#FFD700',
                    color: '#000000'
                  }}
                >
                  บันทึก
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              ตำแหน่งปัจจุบัน
            </Typography>

            <Button
              variant="outlined"
              startIcon={isGettingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              fullWidth
              sx={{
                mb: 2,
                borderColor: '#4CAF50',
                color: '#4CAF50',
                '&:hover': {
                  borderColor: '#45A049',
                  bgcolor: 'rgba(76, 175, 80, 0.04)'
                }
              }}
            >
              {isGettingLocation ? 'กำลังระบุตำแหน่ง...' : 'ตรวจสอบตำแหน่งปัจจุบัน'}
            </Button>

            {locationError && (
              <Box sx={{ 
                p: 2, 
                bgcolor: '#FFEBEE', 
                borderRadius: 2, 
                border: '1px solid #FFCDD2',
                mb: 2
              }}>
                <Typography variant="body2" color="error">
                  ❌ {locationError}
                </Typography>
              </Box>
            )}

            {currentLocation && (
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  📍 ตำแหน่งที่ตรวจพบ
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  หมุดสีแดงแสดงตำแหน่งปัจจุบันของคุณ
                </Typography>
                
                <GoogleMapEmbed 
                  latitude={currentLocation.lat} 
                  longitude={currentLocation.lng}
                  address={currentLocation.address}
                  height={150}
                />
                
                <Box sx={{ 
                  mt: 1,
                  p: 1.5, 
                  bgcolor: '#F9FAFB', 
                  borderRadius: 2, 
                  border: '1px solid #E5E7EB'
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    พิกัด GPS
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </Typography>
                  {currentLocation.address && (
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 0.5 }}>
                        ที่อยู่โดยประมาณ
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {currentLocation.address}
                      </Typography>
                    </>
                  )}
                </Box>

                {/* ปุ่มบันทึกตำแหน่งปัจจุบัน */}
                <Button
                  variant="contained"
                  startIcon={isGettingLocation ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  onClick={handleSaveCurrentLocation}
                  disabled={isGettingLocation}
                  fullWidth
                  sx={{
                    mt: 2,
                    bgcolor: '#4CAF50',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#45A049'
                    },
                    '&:disabled': {
                      bgcolor: '#A5D6A7',
                      color: 'white'
                    }
                  }}
                >
                  {isGettingLocation ? 'กำลังบันทึก...' : 'บันทึกตำแหน่งนี้เป็นที่อยู่หลัก'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* แสดงส่วนความปลอดภัยเฉพาะผู้ใช้ที่ไม่ได้ login ด้วย LINE */}
        {!userData.lineUserId && (
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  ความปลอดภัย
                </Typography>
                {!isChangingPassword && (
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setIsChangingPassword(true)}
                    size="small"
                    sx={{
                      borderColor: '#FF9800',
                      color: '#FF9800',
                      '&:hover': {
                        borderColor: '#F57C00',
                        bgcolor: 'rgba(255, 152, 0, 0.04)'
                      }
                    }}
                  >
                    เปลี่ยนรหัสผ่าน
                  </Button>
                )}
              </Box>

            {isChangingPassword ? (
              <Box>
                <TextField
                  fullWidth
                  type={showPasswords.current ? 'text' : 'password'}
                  label="รหัสผ่านปัจจุบัน"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  type={showPasswords.new ? 'text' : 'password'}
                  label="รหัสผ่านใหม่"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  type={showPasswords.confirm ? 'text' : 'password'}
                  label="ยืนยันรหัสผ่านใหม่"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        edge="end"
                        size="small"
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                />

                {passwordError && (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#FFEBEE', 
                    borderRadius: 2, 
                    border: '1px solid #FFCDD2',
                    mb: 2
                  }}>
                    <Typography variant="body2" color="error">
                      ❌ {passwordError}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCancelPasswordChange}
                    sx={{
                      borderColor: '#E5E7EB',
                      color: '#6B7280'
                    }}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handlePasswordChange}
                    sx={{
                      bgcolor: '#FF9800',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#F57C00'
                      }
                    }}
                  >
                    เปลี่ยนรหัสผ่าน
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี
              </Typography>
            )}
          </CardContent>
        </Card>
        )}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              การตั้งค่า
            </Typography>
            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemText
                  primary="ประวัติการสั่งซื้อ"
                  secondary="ดูประวัติการสั่งอาหารของคุณ"
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemText
                  primary="ที่อยู่ที่บันทึกไว้"
                  secondary="จัดการที่อยู่สำหรับจัดส่ง"
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemText
                  primary="การแจ้งเตือน"
                  secondary="ตั้งค่าการรับข่าวสารและโปรโมชั่น"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          บันทึกข้อมูลเรียบร้อยแล้ว!
        </Alert>
      </Snackbar>

      <BottomNavbar />
    </Box>
  )
} 