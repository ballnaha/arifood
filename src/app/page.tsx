'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useUser } from '@/context/UserContext'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Badge,
  styled,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Divider
} from '@mui/material'
import {
  Star as StarIcon,
  ShoppingCart as CartIcon,
  Search as SearchIcon,
  AccessTime as TimeIcon,
  Store as StoreIcon,
  AccountCircle as AccountCircleIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import BottomNavbar from '@/components/BottomNavbar'
import ClientOnly from '@/components/ClientOnly'
import AppHeader from '@/components/AppHeader'
import LoadingSpinner from '@/components/LoadingSpinner'

// Styled Components
const CategoryButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '16px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#F9FAFB',
    transform: 'translateY(-2px)'
  }
}))

const CategoryIcon = styled(Box)(({ theme }) => ({
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  fontWeight: 500,
  transition: 'all 0.2s ease'
}))

const RestaurantCard = styled(Card)(({ theme }) => ({
  marginBottom: '16px',
  borderRadius: '16px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: '1px solid #F3F4F6',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  '&:hover': {
    borderColor: '#E5E7EB',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  }
}))

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  _count: { products: number }
}

interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  image?: string
  rating: number
  deliveryTime?: string
  isOpen: boolean
  products: Array<{
    id: string
    name: string
    price: number
  }>
}

export default function HomePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const { totalItems } = useCartStore()
  const { userData, isLoggedIn } = useUser()

  // Category colors
  const categoryColors = [
    '#FFF4E6', '#E6F4FF', '#F6FFED', '#FFF1F0', 
    '#F9F0FF', '#FFFBE6', '#E6FFFB', '#FEF2F0'
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, restaurantsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/restaurants')
        ])
        
        const categoriesData = await categoriesRes.json()
        const restaurantsData = await restaurantsRes.json()
        
        setCategories(categoriesData)
        setRestaurants(restaurantsData.filter((restaurant: Restaurant) => restaurant.isOpen))
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'อาหารคาว':
        return '🍛'
      case 'อาหารหวาน':
        return '🍰'
      case 'เครื่องดื่ม':
        return '🥤'
      case 'อาหารเจ':
        return '🥗'
      case 'อาหารฟาสต์ฟู้ด':
        return '🍔'
      case 'อาหารสุขภาพ':
        return '🥙'
      default:
        return '🍽️'
    }
  }

  if (loading) {
    return (
      <>
        <LoadingSpinner fullScreen={true} showBottomNavbar={true} />
        <BottomNavbar />
      </>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 12 }}>
      {/* Header */}
      <ClientOnly>
        <AppHeader showBackButton={false} />
      </ClientOnly>
      
      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        {/* Welcome Message */}
        <ClientOnly fallback={
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
              สวัสดี! 👋
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              มีอะไรอร่อยๆ ให้ทานบ้าง?
            </Typography>
          </Box>
        }>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
              สวัสดี{userData.name ? ` คุณ${userData.name}` : ''}! 👋
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {userData.address ? `📍 ${userData.address}` : 'มีอะไรอร่อยๆ ให้ทานบ้าง?'}
            </Typography>
          </Box>
        </ClientOnly>

        {/* Location Alert - แสดงเฉพาะเมื่อผู้ใช้ยังไม่ได้ตั้งค่า location */}
        <ClientOnly>
          {(!userData.latitude || !userData.longitude) && (
            <Card sx={{ 
              mb: 3, 
              borderRadius: 3,
              border: '1px solid #FED7AA',
              bgcolor: '#FEF3C7',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ 
                    bgcolor: '#F59E0B',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <LocationOnIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600, 
                      color: '#92400E',
                      mb: 1
                    }}>
                      📌 กำหนดตำแหน่งที่อยู่ของท่าน
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#A16207',
                      mb: 2,
                      lineHeight: 1.5
                    }}>
                      เพื่อให้สามารถจัดส่งอาหารได้อย่างแม่นยำและแนะนำร้านอาหารใกล้เคียงได้ดียิ่งขึ้น
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => router.push('/profile')}
                      sx={{
                        bgcolor: '#F59E0B',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#D97706'
                        }
                      }}
                    >
                      ตั้งค่าตำแหน่ง
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </ClientOnly>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="ค้นหาอาหาร ร้านค้า หรือหมวดหมู่..."
            onClick={() => router.push('/search')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
              readOnly: true,
              sx: {
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #E5E7EB'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #D1D5DB'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid #FFD700'
                }
              }
            }}
          />
        </Box>

        {/* Promotional Banner */}
        <Box sx={{
          borderRadius: '12px',
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          height: { xs: 160, sm: 220, md: 280 },
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }}>
          <Box sx={{
            background: '#FFFFFF',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white',
            borderRadius: '12px'
          }}>
            <img src="banner.webp" alt="Promotional Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        </Box>

        {/* Categories */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              หมวดหมู่อาหาร
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                cursor: 'pointer', 
                fontWeight: 500, 
                color: '#6B7280',
                '&:hover': {
                  color: '#374151'
                }
              }}
              onClick={() => router.push('/categories')}
            >
              ดูทั้งหมด
            </Typography>
          </Box>
          <Swiper
            modules={[FreeMode]}
            spaceBetween={12}
            slidesPerView="auto"
            freeMode={true}
            grabCursor={true}
            style={{ paddingLeft: '0px', paddingRight: '0px' }}
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category.slug} style={{ width: 'auto' }}>
                <CategoryButton 
                  onClick={() => router.push(`/categories/${encodeURIComponent(category.slug)}`)}
                >
                  <CategoryIcon sx={{ 
                    backgroundColor: categoryColors[index % categoryColors.length], 
                    border: '1px solid #E5E7EB',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}>
                    {getCategoryIcon(category.name)}
                  </CategoryIcon>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#6B7280',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      maxWidth: '70px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#9CA3AF',
                      fontSize: '0.7rem',
                      textAlign: 'center'
                    }}
                  >
                    {category._count?.products || 0} รายการ
                  </Typography>
                </CategoryButton>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>

        {/* Open Restaurants */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              ร้านค้าที่เปิดอยู่ ({restaurants.length} ร้าน)
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                cursor: 'pointer', 
                fontWeight: 500, 
                color: '#6B7280',
                '&:hover': {
                  color: '#374151'
                }
              }}
              onClick={() => router.push('/restaurant')}
            >
              ดูทั้งหมด
            </Typography>
          </Box>

          {restaurants.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <StoreIcon sx={{ fontSize: 60, color: '#9CA3AF', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
                ไม่มีร้านค้าเปิดอยู่
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                กรุณาลองใหม่อีกครั้งในภายหลัง
              </Typography>
            </Box>
          ) : (
            <Card sx={{ 
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #F3F4F6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {restaurants.map((restaurant, index) => (
                <Box key={restaurant.id}>
                  <Box 
                    onClick={() => router.push(`/restaurant/${restaurant.slug}`)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#F9FAFB'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
                      {/* Restaurant Image */}
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: '#F8F9FA',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {restaurant.image ? (
                          <img 
                            src={restaurant.image} 
                            alt={restaurant.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Box sx={{
                            fontSize: '2.5rem',
                            color: '#9CA3AF'
                          }}>
                            🏪
                          </Box>
                        )}
                      </Box>

                      {/* Restaurant Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#111827',
                              fontSize: '1rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                              mr: 1
                            }}
                          >
                            {restaurant.name}
                          </Typography>
                          <Chip
                            size="small"
                            label="เปิด"
                            sx={{
                              bgcolor: '#10B981',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.3,
                            backgroundColor: '#FEF3C7',
                            px: 1,
                            py: 0.3,
                            borderRadius: '6px'
                          }}>
                            <StarIcon sx={{ fontSize: '0.8rem', color: '#D97706' }} />
                            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 500, fontSize: '0.7rem' }}>
                              {restaurant.rating.toFixed(1)}
                            </Typography>
                          </Box>
                          {restaurant.deliveryTime && (
                            <>
                              <TimeIcon sx={{ fontSize: '0.8rem', color: '#6B7280' }} />
                              <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>
                                {restaurant.deliveryTime}
                              </Typography>
                            </>
                          )}
                        </Box>

                        {restaurant.description && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#6B7280', 
                              fontSize: '0.8rem',
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {restaurant.description}
                          </Typography>
                        )}

                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#9CA3AF',
                            fontSize: '0.75rem'
                          }}
                        >
                          {restaurant.products.length} เมนู
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {index < restaurants.length - 1 && (
                    <Divider sx={{ borderColor: '#F3F4F6' }} />
                  )}
                </Box>
              ))}
            </Card>
          )}
        </Box>
      </Container>

      <BottomNavbar />
    </Box>
  )
} 