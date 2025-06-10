'use client'

import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  NotificationsNone as NotificationsNoneIcon
} from '@mui/icons-material'
import { useUser } from '@/contexts/UserContext'
import { useState, useEffect } from 'react'
import ClientOnly from './ClientOnly'

interface AppHeaderProps {
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  showUserMenu?: boolean
  showHamburger?: boolean
  showNotifications?: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

export default function AppHeader({ 
  title, 
  showBackButton = false, 
  onBack,
  showUserMenu = true,
  showHamburger = true,
  showNotifications = true
}: AppHeaderProps) {
  const router = useRouter()
  const { userData, logout } = useUser()
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'คำสั่งซื้อใหม่',
      message: 'คุณมีคำสั่งซื้อใหม่รออยู่',
      time: '5 นาทีที่แล้ว',
      read: false
    },
    {
      id: '2',
      title: 'โปรโมชั่นพิเศษ',
      message: 'ลด 50% สำหรับอาหารเช้า',
      time: '1 ชั่วโมงที่แล้ว',
      read: false
    },
    {
      id: '3',
      title: 'การจัดส่งสำเร็จ',
      message: 'คำสั่งซื้อ #1234 ถูกส่งแล้ว',
      time: '2 ชั่วโมงที่แล้ว',
      read: true
    }
  ])
  
  const isLoggedIn = !!userData
  const unreadCount = notifications.filter(n => !n.read).length

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null)
  }

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null)
  }

  const handleLogin = () => {
    handleUserMenuClose()
    router.push('/login')
  }

  const handleProfile = () => {
    handleUserMenuClose()
    router.push('/profile')
  }

  const handleLogout = () => {
    handleUserMenuClose()
    logout()
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    handleNotificationClose()
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const names = name.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  const menuItems = [
    { text: 'หน้าแรก', icon: <HomeIcon />, path: '/' },
    { text: 'ร้านอาหาร', icon: <RestaurantIcon />, path: '/restaurants' },
    { text: 'ตะกร้า', icon: <ShoppingCartIcon />, path: '/cart' },
    { text: 'โปรไฟล์', icon: <PersonIcon />, path: '/profile' },
    { text: 'ตั้งค่า', icon: <SettingsIcon />, path: '/settings' }
  ]

  return (
    <>
      <Box sx={{ 
        bgcolor: 'white',
        color: 'black',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
      }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Hamburger Menu / Back Button */}
            {showBackButton ? (
              <IconButton 
                onClick={handleBackClick}
                sx={{ 
                  color: '#666',
                  p: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 193, 7, 0.08)'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            ) : showHamburger ? (
              <IconButton 
                onClick={handleDrawerToggle}
                sx={{ 
                  color: '#FFC107',
                  p: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 193, 7, 0.08)',
                    color: '#FF8F00'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <MenuIcon />
              </IconButton>
            ) : null}

            {/* Title or Logo */}
            {title ? (
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, ml: 1 }}>
                {title}
              </Typography>
            ) : (
              <Box sx={{ flex: 1, ml: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                  AriFood
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                  อาหารอร่อยส่งถึงบ้าน
                </Typography>
              </Box>
            )}

            {/* Right Side Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {/* Notification Bell */}
              {showNotifications && isLoggedIn && (
                <Tooltip title="การแจ้งเตือน">
                  <IconButton 
                    onClick={handleNotificationClick}
                    sx={{ 
                      color: '#666',
                      p: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 193, 7, 0.08)',
                        color: '#FFC107'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Badge 
                      badgeContent={unreadCount} 
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: '#FF8F00',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* User Menu */}
              {showUserMenu && (
                <>
                  {isLoggedIn ? (
                    <Tooltip title={`สวัสดี ${userData?.name || 'สมาชิก'}`}>
                      <Avatar 
                        onClick={handleUserMenuClick}
                        sx={{
                          bgcolor: '#FFC107',
                          color: '#333',
                          width: 36,
                          height: 36,
                          cursor: 'pointer',
                          border: '2px solid #FFD54F',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)',
                          '&:hover': {
                            bgcolor: '#FF8F00',
                            borderColor: '#FFC107',
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {getInitials(userData?.name || 'User')}
                      </Avatar>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LoginIcon />}
                      onClick={handleLogin}
                      sx={{
                        borderColor: '#FFC107',
                        color: '#FFC107',
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1.5,
                        fontWeight: 500,
                        '&:hover': {
                          borderColor: '#FF8F00',
                          color: '#FF8F00',
                          bgcolor: 'rgba(255, 193, 7, 0.08)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      เข้าสู่ระบบ
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#f8f9fa'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                AriFood
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                เมนูหลัก
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerToggle} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {isLoggedIn && (
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: '#FFC107', 
                color: '#333',
                width: 48, 
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 600,
                border: '2px solid #FFD54F',
                boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'
              }}>
                {getInitials(userData?.name || 'User')}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                  {userData?.name || 'สมาชิก'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {userData?.role === 'CUSTOMER' ? 'ลูกค้า' : 
                   userData?.role === 'RESTAURANT_OWNER' ? 'ร้านอาหาร' : 'Rider'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <List sx={{ flex: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => {
                router.push(item.path)
                setDrawerOpen(false)
              }}
              sx={{
                py: 1.5,
                mx: 1,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 193, 7, 0.08)'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#FFC107', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: '#333'
                }}
              />
            </ListItemButton>
          ))}
        </List>

        {isLoggedIn && (
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={() => {
                logout()
                setDrawerOpen(false)
              }}
              sx={{
                color: '#ef4444',
                borderColor: '#ef4444',
                '&:hover': {
                  borderColor: '#dc2626',
                  bgcolor: '#fef2f2'
                }
              }}
            >
              ออกจากระบบ
            </Button>
          </Box>
        )}
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="body2" fontWeight={600} color="#333">
            {userData?.name || 'สมาชิก'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userData?.email}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleProfile} sx={{ gap: 1.5, py: 1.5 }}>
          <PersonIcon fontSize="small" color="primary" />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              ข้อมูลส่วนตัว
            </Typography>
            <Typography variant="caption" color="text.secondary">
              แก้ไขโปรไฟล์
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.5, color: '#EF4444' }}>
          <LogoutIcon fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            ออกจากระบบ
          </Typography>
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            width: 320,
            maxHeight: 400,
            mt: 1
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            การแจ้งเตือน
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={handleMarkAllRead}
              sx={{ fontSize: '0.75rem' }}
            >
              อ่านทั้งหมด
            </Button>
          )}
        </Box>
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              ไม่มีการแจ้งเตือน
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationRead(notification.id)}
                sx={{
                  display: 'block',
                  p: 2,
                  borderBottom: '1px solid #f5f5f5',
                  bgcolor: notification.read ? 'transparent' : '#f8f9ff',
                  '&:hover': {
                    bgcolor: notification.read ? '#f5f5f5' : '#f0f2ff'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  {!notification.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#2196f3',
                        mt: 0.5,
                        flexShrink: 0
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={notification.read ? 400 : 600}
                      sx={{ mb: 0.5 }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="primary.main">
                      {notification.time}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}
      </Menu>
    </>
  )
} 