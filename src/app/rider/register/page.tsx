'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import {
  TwoWheeler as MotorcycleIcon,
  DirectionsBike as BikeIcon,
  DirectionsCar as CarIcon,
  DirectionsWalk as WalkIcon
} from '@mui/icons-material'
import { z } from 'zod'

const riderSchema = z.object({
  // User Information
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^[0-9]{10}$/, 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก'),
  address: z.string().min(10, 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร'),
  
  // Rider Specific Information
  licenseNumber: z.string().optional(),
  vehicleType: z.enum(['MOTORCYCLE', 'BICYCLE', 'CAR', 'WALK']),
  vehiclePlate: z.string().optional(),
  bankAccount: z.string().min(10, 'เลขบัญชีต้องมีอย่างน้อย 10 หลัก'),
  bankName: z.string().min(2, 'ชื่อธนาคารต้องมีอย่างน้อย 2 ตัวอักษร'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
})

const steps = ['ข้อมูลส่วนตัว', 'ข้อมูลการจัดส่ง', 'ข้อมูลธนาคาร']

const vehicleOptions = [
  { value: 'MOTORCYCLE', label: 'มอเตอร์ไซค์', icon: <MotorcycleIcon /> },
  { value: 'BICYCLE', label: 'จักรยาน', icon: <BikeIcon /> },
  { value: 'CAR', label: 'รถยนต์', icon: <CarIcon /> },
  { value: 'WALK', label: 'เดินเท้า', icon: <WalkIcon /> }
]

export default function RiderRegisterPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    licenseNumber: '',
    vehicleType: 'MOTORCYCLE',
    vehiclePlate: '',
    bankAccount: '',
    bankName: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Auto-format phone number
    if (field === 'phone') {
      const cleaned = value.replace(/\D/g, '')
      const limited = cleaned.slice(0, 10)
      setFormData(prev => ({ ...prev, [field]: limited }))
    }
  }

  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {}

    if (step === 0) {
      // Personal Information
      if (!formData.name.trim()) stepErrors.name = 'กรุณากรอกชื่อ'
      if (!formData.email.trim()) stepErrors.email = 'กรุณากรอกอีเมล'
      if (!formData.password) stepErrors.password = 'กรุณากรอกรหัสผ่าน'
      if (!formData.confirmPassword) stepErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
      if (formData.password !== formData.confirmPassword) {
        stepErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
      }
      if (!formData.phone.trim()) stepErrors.phone = 'กรุณากรอกเบอร์โทร'
      if (!formData.address.trim()) stepErrors.address = 'กรุณากรอกที่อยู่'
    } else if (step === 1) {
      // Delivery Information
      if (formData.vehicleType === 'MOTORCYCLE' || formData.vehicleType === 'CAR') {
        if (!formData.licenseNumber?.trim()) {
          stepErrors.licenseNumber = 'กรุณากรอกหมายเลขใบขับขี่สำหรับยานพาหนะนี้'
        }
        if (!formData.vehiclePlate?.trim()) {
          stepErrors.vehiclePlate = 'กรุณากรอกทะเบียนรถ'
        }
      }
    } else if (step === 2) {
      // Bank Information
      if (!formData.bankAccount.trim()) stepErrors.bankAccount = 'กรุณากรอกเลขบัญชีธนาคาร'
      if (!formData.bankName.trim()) stepErrors.bankName = 'กรุณากรอกชื่อธนาคาร'
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return

    try {
      setLoading(true)
      setMessage(null)

      // Validate all data with zod
      const validationResult = riderSchema.safeParse(formData)
      if (!validationResult.success) {
        const zodErrors: Record<string, string> = {}
        validationResult.error.errors.forEach(err => {
          if (err.path[0]) {
            zodErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(zodErrors)
        return
      }

      const response = await fetch('/api/riders/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'สมัครไรเดอร์สำเร็จ! รอการอนุมัติจากทีมงาน ระบบจะแจ้งทางอีเมลเมื่อได้รับการอนุมัติ' 
        })
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาดในการสมัคร' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Typography variant="h6" gutterBottom>ข้อมูลส่วนตัว</Typography>
            
            <TextField
              fullWidth
              label="ชื่อ-นามสกุล"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone || '10 หลัก ไม่ต้องใส่ขีด'}
                placeholder="0812345678"
                required
              />
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="รหัสผ่าน"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                required
              />
              <TextField
                fullWidth
                label="ยืนยันรหัสผ่าน"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
              />
            </Box>
            
            <TextField
              fullWidth
              label="ที่อยู่"
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              error={!!errors.address}
              helperText={errors.address}
              required
            />
          </Box>
        )

      case 1:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Typography variant="h6" gutterBottom>ข้อมูลการจัดส่ง</Typography>
            
            <FormControl fullWidth required>
              <InputLabel>ประเภทยานพาหนะ</InputLabel>
              <Select
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                label="ประเภทยานพาหนะ"
              >
                {vehicleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {(formData.vehicleType === 'MOTORCYCLE' || formData.vehicleType === 'CAR') && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  fullWidth
                  label="หมายเลขใบขับขี่"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  error={!!errors.licenseNumber}
                  helperText={errors.licenseNumber}
                  required
                />
                <TextField
                  fullWidth
                  label="ทะเบียนรถ"
                  value={formData.vehiclePlate}
                  onChange={(e) => handleInputChange('vehiclePlate', e.target.value)}
                  error={!!errors.vehiclePlate}
                  helperText={errors.vehiclePlate}
                  placeholder="กข-1234"
                  required
                />
              </Box>
            )}
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  📋 เงื่อนไขสำหรับไรเดอร์
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • ต้องมีอายุ 18 ปีขึ้นไป<br/>
                  • สำหรับมอเตอร์ไซค์และรถยนต์ ต้องมีใบขับขี่ที่ยังไม่หมดอายุ<br/>
                  • ต้องผ่านการอนุมัติจากทีมงานก่อนเริ่มงาน<br/>
                  • จะได้รับการติดต่อทางอีเมลเมื่อผ่านการอนุมัติ
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>ข้อมูลธนาคาร</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                สำหรับการรับเงินค่าขนส่ง
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="ชื่อธนาคาร"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                error={!!errors.bankName}
                helperText={errors.bankName}
                placeholder="ธนาคารกสิกรไทย"
                required
              />
              <TextField
                fullWidth
                label="เลขบัญชีธนาคาร"
                value={formData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                error={!!errors.bankAccount}
                helperText={errors.bankAccount}
                placeholder="123-456-7890"
                required
              />
            </Box>
            
            <Alert severity="info">
              <Typography variant="body2">
                <strong>หมายเหตุ:</strong> บัญชีธนาคารต้องเป็นชื่อเดียวกับผู้สมัคร และจะใช้สำหรับโอนเงินค่าจัดส่งทุกสัปดาห์
              </Typography>
            </Alert>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          🛵 สมัครไรเดอร์ AriFoodDelivery
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          เข้าร่วมทีมไรเดอร์และเริ่มหารายได้วันนี้
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            ย้อนกลับ
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครไรเดอร์'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              ถัดไป
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            มีบัญชีอยู่แล้ว? 
            <Button href="/login" sx={{ ml: 1 }}>
              เข้าสู่ระบบ
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
} 