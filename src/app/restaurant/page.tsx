'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material'
import BottomNavbar from '@/components/BottomNavbar'

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

export default function RestaurantListPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants')
        const data = await response.json()
        setRestaurants(data)
        setFilteredRestaurants(data)
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  useEffect(() => {
    let filtered = restaurants
    
    if (filter === 'open') {
      filtered = restaurants.filter(r => r.isOpen)
    } else if (filter === 'closed') {
      filtered = restaurants.filter(r => !r.isOpen)
    }

    setFilteredRestaurants(filtered)
  }, [filter, restaurants])

  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: 'all' | 'open' | 'closed') => {
    if (newFilter !== null) {
      setFilter(newFilter)
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
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              ร้านค้าทั้งหมด ({filteredRestaurants.length} ร้าน)
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        {/* Filter */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
            sx={{ display: 'flex', width: '100%' }}
          >
            <ToggleButton 
              value="all" 
              sx={{ 
                flex: 1,
                '&.Mui-selected': {
                  backgroundColor: '#FFD700',
                  color: '#000'
                }
              }}
            >
              ทั้งหมด ({restaurants.length})
            </ToggleButton>
            <ToggleButton 
              value="open"
              sx={{ 
                flex: 1,
                '&.Mui-selected': {
                  backgroundColor: '#10B981',
                  color: 'white'
                }
              }}
            >
              เปิด ({restaurants.filter(r => r.isOpen).length})
            </ToggleButton>
            <ToggleButton 
              value="closed"
              sx={{ 
                flex: 1,
                '&.Mui-selected': {
                  backgroundColor: '#EF4444',
                  color: 'white'
                }
              }}
            >
              ปิด ({restaurants.filter(r => !r.isOpen).length})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Restaurant List */}
        {filteredRestaurants.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>🏪</Typography>
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              {filter === 'open' ? 'ไม่มีร้านค้าเปิดอยู่' : 
               filter === 'closed' ? 'ไม่มีร้านค้าปิด' : 
               'ไม่พบร้านค้า'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 3 }}>
              {filter === 'open' ? 'กรุณาลองใหม่อีกครั้งในภายหลัง' : 
               filter === 'closed' ? 'ร้านค้าทั้งหมดเปิดให้บริการอยู่' : 
               'ยังไม่มีร้านค้าในระบบ'}
            </Typography>
            {filter !== 'all' && (
              <Button 
                onClick={() => setFilter('all')}
                variant="outlined"
                sx={{ 
                  color: '#FFD700',
                  borderColor: '#FFD700'
                }}
              >
                ดูร้านค้าทั้งหมด
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid #F3F4F6',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  '&:hover': {
                    borderColor: '#E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => router.push(`/restaurant/${restaurant.slug}`)}
              >
                <CardContent sx={{ p: 0 }}>
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
                          label={restaurant.isOpen ? 'เปิด' : 'ปิด'}
                          sx={{
                            bgcolor: restaurant.isOpen ? '#10B981' : '#EF4444',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20
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

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#9CA3AF',
                            fontSize: '0.75rem'
                          }}
                        >
                          {restaurant.products.length} เมนู
                        </Typography>
                        
                        {restaurant.address && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#9CA3AF',
                              fontSize: '0.7rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '120px'
                            }}
                          >
                            📍 {restaurant.address}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      <BottomNavbar />
    </Box>
  )
} 