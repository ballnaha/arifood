'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tab,
  Tabs,
  Card,
  CardContent,
  Button
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Star as StarIcon
} from '@mui/icons-material'
import BottomNavbar from '@/components/BottomNavbar'
import AppHeader from '@/components/AppHeader'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image?: string
  rating: number
  category: {
    name: string
  }
  restaurant: {
    name: string
    slug: string
  }
}

interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
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

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [tabValue, setTabValue] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }, [searchQuery])

  const performSearch = async (query: string) => {
    setLoading(true)
    try {
      const [productsRes, restaurantsRes] = await Promise.all([
        fetch(`/api/products?search=${encodeURIComponent(query)}`),
        fetch('/api/restaurants')
      ])
      
      const productsData = await productsRes.json()
      const restaurantsData = await restaurantsRes.json()
      
      setProducts(productsData)
      
      // Filter restaurants by name or description
      const filteredRestaurants = restaurantsData.filter((restaurant: Restaurant) =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(query.toLowerCase())
      )
      setRestaurants(filteredRestaurants)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      performSearch(query)
    } else {
      setProducts([])
      setRestaurants([])
    }
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 12 }}>
      {/* Header */}
      <AppHeader title="ค้นหา" showBackButton={true} />
      
      {/* Search Bar */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
          <TextField
            fullWidth
            placeholder="ค้นหาอาหาร ร้านค้า หรือหมวดหมู่..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9CA3AF' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #E5E7EB'
                }
              }
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        {!searchQuery.trim() ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 60, color: '#9CA3AF', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              ค้นหาสิ่งที่คุณต้องการ
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              ป้อนชื่ออาหาร ร้านค้า หรือหมวดหมู่ที่ต้องการ
            </Typography>
          </Box>
        ) : (
          <>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="fullWidth"
              >
                <Tab label={`อาหาร (${products.length})`} />
                <Tab label={`ร้านค้า (${restaurants.length})`} />
              </Tabs>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  กำลังค้นหา...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Products Tab */}
                {tabValue === 0 && (
                  <Box>
                    {products.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography sx={{ fontSize: '4rem', mb: 2 }}>🔍</Typography>
                        <Typography variant="h6" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
                          ไม่พบอาหารที่ค้นหา
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>
                          ลองค้นหาด้วยคำอื่น หรือเลือกจากหมวดหมู่
                        </Typography>
                        <Button 
                          onClick={() => router.push('/categories')}
                          variant="outlined"
                          sx={{ 
                            color: '#FFD700',
                            borderColor: '#FFD700'
                          }}
                        >
                          ดูหมวดหมู่ทั้งหมด
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {products.map((product) => (
                          <Card
                            key={product.id}
                            sx={{
                              display: 'flex',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                              },
                            }}
                            onClick={() => router.push(`/products/${product.slug}`)}
                          >
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                backgroundColor: '#F8F9FA',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '12px 0 0 12px',
                                overflow: 'hidden',
                                flexShrink: 0
                              }}
                            >
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <Typography sx={{ fontSize: '2.5rem', opacity: 0.7 }}>
                                  🍽️
                                </Typography>
                              )}
                            </Box>
                            <CardContent sx={{ flex: 1, p: 2 }}>
                              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem', mb: 0.5 }}>
                                {product.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                                {product.restaurant.name} • {product.category.name}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {product.originalPrice && (
                                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#9CA3AF' }}>
                                      ฿{product.originalPrice}
                                    </Typography>
                                  )}
                                  <Typography variant="h6" color="primary.main" fontWeight={600}>
                                    ฿{product.price}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />
                                  <Typography variant="body2" fontWeight={500}>
                                    {product.rating}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Restaurants Tab */}
                {tabValue === 1 && (
                  <Box>
                    {restaurants.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography sx={{ fontSize: '4rem', mb: 2 }}>🏪</Typography>
                        <Typography variant="h6" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
                          ไม่พบร้านค้าที่ค้นหา
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>
                          ลองค้นหาด้วยชื่อร้านอื่น
                        </Typography>
                        <Button 
                          onClick={() => router.push('/restaurant')}
                          variant="outlined"
                          sx={{ 
                            color: '#FFD700',
                            borderColor: '#FFD700'
                          }}
                        >
                          ดูร้านค้าทั้งหมด
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {restaurants.map((restaurant) => (
                          <Card
                            key={restaurant.id}
                            sx={{
                              display: 'flex',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                              },
                            }}
                            onClick={() => router.push(`/restaurant/${restaurant.slug}`)}
                          >
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                backgroundColor: '#F8F9FA',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '12px 0 0 12px',
                                overflow: 'hidden',
                                flexShrink: 0
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
                                <Typography sx={{ fontSize: '2.5rem', opacity: 0.7 }}>
                                  🏪
                                </Typography>
                              )}
                            </Box>
                            <CardContent sx={{ flex: 1, p: 2 }}>
                              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem', mb: 0.5 }}>
                                {restaurant.name}
                              </Typography>
                              {restaurant.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                                  {restaurant.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />
                                  <Typography variant="body2" fontWeight={500}>
                                    {restaurant.rating.toFixed(1)}
                                  </Typography>
                                  {restaurant.deliveryTime && (
                                    <Typography variant="body2" color="text.secondary">
                                      • {restaurant.deliveryTime}
                                    </Typography>
                                  )}
                                </Box>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: restaurant.isOpen ? '#10B981' : '#EF4444',
                                    fontWeight: 500
                                  }}
                                >
                                  {restaurant.isOpen ? 'เปิด' : 'ปิด'}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Container>

      <BottomNavbar />
    </Box>
  )
} 