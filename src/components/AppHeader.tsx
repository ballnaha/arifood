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
  Avatar
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useUser } from '@/context/UserContext'
import { useState, useEffect } from 'react'
import ClientOnly from './ClientOnly'

interface AppHeaderProps {
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  showUserMenu?: boolean
}

export default function AppHeader({ 
  title, 
  showBackButton = false, 
  onBack,
  showUserMenu = true 
}: AppHeaderProps) {
  const router = useRouter()
  const { userData, isLoggedIn, logout } = useUser()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
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

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const names = name.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showBackButton && (
            <IconButton onClick={handleBackClick}>
              <ArrowBackIcon />
            </IconButton>
          )}

          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {title}
            </Typography>
          )}

          {showUserMenu && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              {isLoggedIn ? (
                <>
                  <Box sx={{ textAlign: 'right', mr: 1 }}>
                    <ClientOnly fallback={<Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>กำลังโหลด...</Typography>}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#000' }}>
                        {userData.lineUserId 
                          ? (userData.name && userData.name.trim() ? userData.name : 'ผู้ใช้ LINE')
                          : (userData.name && userData.name.trim() ? userData.name : 'สมาชิก')
                        }
                      </Typography>
                    </ClientOnly>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      สมาชิก
                    </Typography>
                  </Box>
                  <Avatar 
                    onClick={handleUserMenuClick}
                    src={userData.avatar}
                    sx={{
                      bgcolor: '#FFD700',
                      color: '#000',
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#FFC107'
                      }
                    }}
                  >
                    {!userData.avatar && getInitials(userData.name)}
                  </Avatar>
                </>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LoginIcon />}
                  onClick={handleLogin}
                  sx={{
                    borderColor: '#FFD700',
                    color: '#FFD700',
                    '&:hover': {
                      borderColor: '#FFC107',
                      bgcolor: 'rgba(255, 215, 0, 0.1)'
                    }
                  }}
                >
                  เข้าสู่ระบบ
                </Button>
              )}

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    minWidth: 180
                  }
                }}
              >
                <MenuItem onClick={handleProfile} sx={{ gap: 1.5 }}>
                  <PersonIcon fontSize="small" />
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
                
                <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: '#EF4444' }}>
                  <LogoutIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={600}>
                    ออกจากระบบ
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  )
} 