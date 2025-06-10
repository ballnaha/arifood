'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material'
import { 
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Pause as SuspendIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  DirectionsBike as BikeIcon,
  TwoWheeler as MotorcycleIcon,
  DirectionsCar as CarIcon,
  DirectionsWalk as WalkIcon
} from '@mui/icons-material'
import { useUser } from '../../contexts/UserContext'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

interface Restaurant {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: string
  createdAt: string
  owner: {
    name: string
    email: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string
  isActive: boolean
  createdAt: string
  restaurant?: {
    name: string
    status: string
  }
  riderProfile?: {
    vehicleType: string
    vehiclePlate: string
    status: string
    rating: number
    totalDeliveries: number
  }
}

interface Rider {
  id: string
  licenseNumber: string
  vehicleType: string
  vehiclePlate: string
  bankAccount: string
  bankName: string
  status: string
  isOnline: boolean
  rating: number
  totalDeliveries: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    phone: string
  }
}

interface Stats {
  totalUsers: number
  totalCustomers: number
  totalRestaurantOwners: number
  totalRiders: number
  approvedRestaurants: number
  pendingRestaurants: number
  approvedRiders: number
  pendingRiders: number
}

export default function AdminClient() {
  const router = useRouter()
  const { userData, isLoading } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [riders, setRiders] = useState<Rider[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCustomers: 0,
    totalRestaurantOwners: 0,
    totalRiders: 0,
    approvedRestaurants: 0,
    pendingRestaurants: 0,
    approvedRiders: 0,
    pendingRiders: 0
  })
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [riderDialogOpen, setRiderDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Prevent hydration error
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // ตรวจสอบสิทธิ์ admin
  useEffect(() => {
    if (isMounted && !isLoading && (!userData || userData.role !== 'ADMIN')) {
      router.push('/')
    }
  }, [userData, isLoading, router, isMounted])

  useEffect(() => {
    if (isMounted && userData?.role === 'ADMIN') {
      fetchData()
    }
  }, [userData, isMounted])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [restaurantsRes, usersRes, ridersRes] = await Promise.all([
        fetch('/api/admin/restaurants'),
        fetch('/api/admin/users'),
        fetch('/api/admin/riders')
      ])

      let restaurantsData: Restaurant[] = []
      let usersData: User[] = []
      let ridersData: Rider[] = []

      if (restaurantsRes.ok) {
        restaurantsData = await restaurantsRes.json()
        setRestaurants(restaurantsData)
      }

      if (usersRes.ok) {
        usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (ridersRes.ok) {
        ridersData = await ridersRes.json()
        setRiders(ridersData)
      }

      // Calculate stats using the same data
      setStats({
        totalUsers: usersData.length,
        totalCustomers: usersData.filter((u: User) => u.role === 'CUSTOMER').length,
        totalRestaurantOwners: usersData.filter((u: User) => u.role === 'RESTAURANT_OWNER').length,
        totalRiders: usersData.filter((u: User) => u.role === 'RIDER').length,
        approvedRestaurants: restaurantsData.filter((r: Restaurant) => r.status === 'APPROVED').length,
        pendingRestaurants: restaurantsData.filter((r: Restaurant) => r.status === 'PENDING').length,
        approvedRiders: ridersData.filter((r: Rider) => r.status === 'APPROVED').length,
        pendingRiders: ridersData.filter((r: Rider) => r.status === 'PENDING').length,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' })
    } finally {
      setLoading(false)
    }
  }

  const handleRestaurantStatusChange = async (restaurantId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/restaurants/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'อัพเดตสถานะร้านอาหารสำเร็จ' })
        fetchData()
        setDialogOpen(false)
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพเดตสถานะ' })
      }
    } catch (error) {
      console.error('Error updating restaurant status:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    }
  }

  const handleRiderStatusChange = async (riderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/riders/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riderId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'อัพเดตสถานะไรเดอร์สำเร็จ' })
        fetchData()
        setRiderDialogOpen(false)
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัพเดตสถานะ' })
      }
    } catch (error) {
      console.error('Error updating rider status:', error)
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success'
      case 'PENDING': return 'warning'
      case 'REJECTED': return 'error'
      case 'SUSPENDED': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'อนุมัติแล้ว'
      case 'PENDING': return 'รอการอนุมัติ'
      case 'REJECTED': return 'ถูกปฏิเสธ'
      case 'SUSPENDED': return 'ถูกระงับ'
      default: return status
    }
  }

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'MOTORCYCLE': return <MotorcycleIcon />
      case 'BICYCLE': return <BikeIcon />
      case 'CAR': return <CarIcon />
      case 'WALK': return <WalkIcon />
      default: return <MotorcycleIcon />
    }
  }

  const getVehicleText = (vehicleType: string) => {
    switch (vehicleType) {
      case 'MOTORCYCLE': return 'มอเตอร์ไซค์'
      case 'BICYCLE': return 'จักรยาน'
      case 'CAR': return 'รถยนต์'
      case 'WALK': return 'เดินเท้า'
      default: return vehicleType
    }
  }

  // Loading state สำหรับป้องกัน hydration error
  if (isLoading || !isMounted || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  // Access control
  if (!userData || userData.role !== 'ADMIN') {
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🛡️ ระบบจัดการผู้ดูแล
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

      {/* สถิติ */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              👥 ผู้ใช้งานทั้งหมด
            </Typography>
            <Typography variant="h4">
              {stats.totalUsers}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              🏪 ร้านอาหารที่อนุมัติ
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.approvedRestaurants}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              🛵 ไรเดอร์ที่อนุมัติ
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.approvedRiders}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              ⏳ รอการอนุมัติ
            </Typography>
            <Typography variant="h4" color="warning.main">
              {stats.pendingRestaurants + stats.pendingRiders}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="🏪 ร้านอาหาร" />
          <Tab label="🛵 ไรเดอร์" />
          <Tab label="👥 ผู้ใช้งาน" />
        </Tabs>

        {/* แท็บร้านอาหาร */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อร้าน</TableCell>
                  <TableCell>เจ้าของ</TableCell>
                  <TableCell>เบอร์โทร</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>วันที่สมัคร</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {restaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>{restaurant.name}</TableCell>
                    <TableCell>{restaurant.owner.name}</TableCell>
                    <TableCell>{restaurant.phone}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(restaurant.status)}
                        color={getStatusColor(restaurant.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(restaurant.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ดูรายละเอียด">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRestaurant(restaurant)
                            setDialogOpen(true)
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* แท็บไรเดอร์ */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อ</TableCell>
                  <TableCell>ประเภทยานพาหนะ</TableCell>
                  <TableCell>ทะเบียน</TableCell>
                  <TableCell>เรทติ้ง</TableCell>
                  <TableCell>จำนวนการจัดส่ง</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>ออนไลน์</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {riders.map((rider) => (
                  <TableRow key={rider.id}>
                    <TableCell>{rider.user.name}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getVehicleIcon(rider.vehicleType)}
                        {getVehicleText(rider.vehicleType)}
                      </Box>
                    </TableCell>
                    <TableCell>{rider.vehiclePlate || '-'}</TableCell>
                    <TableCell>⭐ {rider.rating.toFixed(1)}</TableCell>
                    <TableCell>{rider.totalDeliveries} ครั้ง</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(rider.status)}
                        color={getStatusColor(rider.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rider.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                        color={rider.isOnline ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ดูรายละเอียด">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRider(rider)
                            setRiderDialogOpen(true)
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* แท็บผู้ใช้งาน */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อ</TableCell>
                  <TableCell>อีเมล</TableCell>
                  <TableCell>บทบาท</TableCell>
                  <TableCell>เบอร์โทร</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>วันที่สมัคร</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          user.role === 'CUSTOMER' ? 'ลูกค้า' :
                          user.role === 'RESTAURANT_OWNER' ? 'เจ้าของร้าน' :
                          user.role === 'RIDER' ? 'ไรเดอร์' :
                          user.role === 'ADMIN' ? 'ผู้ดูแล' : user.role
                        }
                        size="small"
                        color={
                          user.role === 'ADMIN' ? 'error' :
                          user.role === 'RESTAURANT_OWNER' ? 'primary' :
                          user.role === 'RIDER' ? 'secondary' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Dialog รายละเอียดร้านอาหาร */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>รายละเอียดร้านอาหาร</DialogTitle>
        <DialogContent>
          {selectedRestaurant && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2">ชื่อร้าน</Typography>
                <Typography>{selectedRestaurant.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">เจ้าของ</Typography>
                <Typography>{selectedRestaurant.owner.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">อีเมล</Typography>
                <Typography>{selectedRestaurant.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">เบอร์โทร</Typography>
                <Typography>{selectedRestaurant.phone}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2">ที่อยู่</Typography>
                <Typography>{selectedRestaurant.address}</Typography>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2">สถานะปัจจุบัน</Typography>
                <Chip 
                  label={getStatusText(selectedRestaurant.status)}
                  color={getStatusColor(selectedRestaurant.status) as any}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<EmailIcon />}
            onClick={() => window.open(`mailto:${selectedRestaurant?.owner.email}`)}
          >
            ส่งอีเมล
          </Button>
          <Button
            startIcon={<PhoneIcon />}
            onClick={() => window.open(`tel:${selectedRestaurant?.phone}`)}
          >
            โทร
          </Button>
          <Button onClick={() => setDialogOpen(false)}>ปิด</Button>
          {selectedRestaurant?.status === 'PENDING' && (
            <>
              <Button
                startIcon={<ApproveIcon />}
                color="success"
                onClick={() => handleRestaurantStatusChange(selectedRestaurant.id, 'APPROVED')}
              >
                อนุมัติ
              </Button>
              <Button
                startIcon={<RejectIcon />}
                color="error"
                onClick={() => handleRestaurantStatusChange(selectedRestaurant.id, 'REJECTED')}
              >
                ปฏิเสธ
              </Button>
            </>
          )}
          {selectedRestaurant?.status === 'APPROVED' && (
            <Button
              startIcon={<SuspendIcon />}
              color="warning"
              onClick={() => handleRestaurantStatusChange(selectedRestaurant.id, 'SUSPENDED')}
            >
              ระงับ
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog รายละเอียดไรเดอร์ */}
      <Dialog open={riderDialogOpen} onClose={() => setRiderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>รายละเอียดไรเดอร์</DialogTitle>
        <DialogContent>
          {selectedRider && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2">ชื่อ</Typography>
                <Typography>{selectedRider.user.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">อีเมล</Typography>
                <Typography>{selectedRider.user.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">เบอร์โทร</Typography>
                <Typography>{selectedRider.user.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">หมายเลขใบขับขี่</Typography>
                <Typography>{selectedRider.licenseNumber || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">ประเภทยานพาหนะ</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {getVehicleIcon(selectedRider.vehicleType)}
                  <Typography>{getVehicleText(selectedRider.vehicleType)}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2">ทะเบียนรถ</Typography>
                <Typography>{selectedRider.vehiclePlate || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">บัญชีธนาคาร</Typography>
                <Typography>{selectedRider.bankAccount}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">ธนาคาร</Typography>
                <Typography>{selectedRider.bankName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">เรทติ้ง</Typography>
                <Typography>⭐ {selectedRider.rating.toFixed(1)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">จำนวนการจัดส่ง</Typography>
                <Typography>{selectedRider.totalDeliveries} ครั้ง</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">สถานะปัจจุบัน</Typography>
                <Chip 
                  label={getStatusText(selectedRider.status)}
                  color={getStatusColor(selectedRider.status) as any}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2">สถานะออนไลน์</Typography>
                <Chip 
                  label={selectedRider.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                  color={selectedRider.isOnline ? 'success' : 'default'}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<EmailIcon />}
            onClick={() => window.open(`mailto:${selectedRider?.user.email}`)}
          >
            ส่งอีเมล
          </Button>
          <Button
            startIcon={<PhoneIcon />}
            onClick={() => window.open(`tel:${selectedRider?.user.phone}`)}
          >
            โทร
          </Button>
          <Button onClick={() => setRiderDialogOpen(false)}>ปิด</Button>
          {selectedRider?.status === 'PENDING' && (
            <>
              <Button
                startIcon={<ApproveIcon />}
                color="success"
                onClick={() => handleRiderStatusChange(selectedRider.id, 'APPROVED')}
              >
                อนุมัติ
              </Button>
              <Button
                startIcon={<RejectIcon />}
                color="error"
                onClick={() => handleRiderStatusChange(selectedRider.id, 'REJECTED')}
              >
                ปฏิเสธ
              </Button>
            </>
          )}
          {selectedRider?.status === 'APPROVED' && (
            <Button
              startIcon={<SuspendIcon />}
              color="warning"
              onClick={() => handleRiderStatusChange(selectedRider.id, 'SUSPENDED')}
            >
              ระงับ
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  )
} 