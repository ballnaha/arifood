'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useUser } from '@/contexts/UserContext'
import { useCartAuth } from '@/hooks/useCartAuth'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Paper,
  Skeleton,
  Alert
} from '@mui/material'
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  FilterList as FilterIcon,
  FavoriteBorder as FavoriteIcon,
  Favorite as FavoriteFilledIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Add as AddIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import BottomNavbar from '@/components/BottomNavbar'
import AppHeader from '@/components/AppHeader'
import ClientOnly from '@/components/ClientOnly'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  _count?: { products: number }
}

interface Product {
  id: string
  name: string
  price: number
  image?: string
  description?: string
  categoryId?: string
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
  products?: Product[]
}

export default function HomePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [displayProducts, setDisplayProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const { totalItems, addItem } = useCartStore()
  const { userData } = useUser()
  
  useCartAuth()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [selectedCategory, allProducts, searchQuery])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch categories and restaurants separately for better error handling
      try {
        const categoriesRes = await fetch('/api/categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          if (Array.isArray(categoriesData)) {
            setCategories(categoriesData)
          }
        }
      } catch (error) {
        console.error('Categories API error:', error)
      }
      
      try {
        const restaurantsRes = await fetch('/api/restaurants')
        if (restaurantsRes.ok) {
          const restaurantsData = await restaurantsRes.json()
          if (Array.isArray(restaurantsData)) {
            const openRestaurants = restaurantsData.filter((r: Restaurant) => r.isOpen)
            setRestaurants(openRestaurants)
            
            // Extract all products from restaurants
            const products: Product[] = []
            openRestaurants.forEach((restaurant: Restaurant) => {
              if (restaurant.products && Array.isArray(restaurant.products)) {
                restaurant.products.forEach((product: Product) => {
                  products.push({
                    ...product,
                    restaurantName: restaurant.name,
                    restaurantId: restaurant.id
                  } as Product & { restaurantName: string; restaurantId: string })
                })
              }
            })
            setAllProducts(products)
          }
        }
      } catch (error) {
        console.error('Restaurants API error:', error)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = allProducts
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      )
    }
    
    setDisplayProducts(filtered.slice(0, 10)) // Show top 10
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const handleAddToCart = (product: Product & { restaurantName?: string }) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categoryName: 'อาหาร',
      restaurantName: product.restaurantName || 'ไม่ระบุร้าน'
    })
  }

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'อาหารคาว': return '🍛'
      case 'อาหารหวาน': return '🍰'
      case 'เครื่องดื่ม': return '🥤'
      case 'อาหารเจ': return '🥗'
      case 'อาหารฟาสต์ฟู้ด': return '🍔'
      case 'พิซซ่า': return '🍕'
      default: return '🍽️'
    }
  }

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 10 }}>
        <Box sx={{ bgcolor: 'white', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="rounded" width="100%" height={40} />
        </Box>
        <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {[1,2,3].map(i => (
              <Skeleton key={i} variant="rounded" width={80} height={32} />
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            {[1,2,3,4].map(i => (
              <Card key={i}>
                <Skeleton variant="rounded" width="100%" height={120} />
                <CardContent>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
        <BottomNavbar />
      </Box>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <AppHeader />

      {/* Search Section */}
      <Box sx={{ bgcolor: 'white', px: 3, pb: 3, borderRadius: '0 0 20px 20px' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="หาอาหารที่ชอบ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F8F9FA',
                borderRadius: 2,
                fontSize: '0.9rem',
                '& fieldset': { border: 'none' },
                height: 44
              }
            }}
          />
          <IconButton 
            sx={{ 
              bgcolor: '#F8F9FA',
              borderRadius: 2,
              width: 44,
              height: 44
            }}
          >
            <FilterIcon sx={{ color: '#999' }} />
          </IconButton>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ px: 3, py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button 
              onClick={fetchData} 
              size="small" 
              sx={{ ml: 2 }}
            >
              ลองใหม่
            </Button>
          </Alert>
        )}

        {/* Categories */}
        <Box sx={{ mb: 3 }}>
          <Swiper
            modules={[FreeMode]}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            style={{ paddingLeft: '0px', paddingRight: '0px' }}
          >
            <SwiperSlide style={{ width: 'auto' }}>
              <Chip
                label="ทั้งหมด"
                onClick={() => handleCategorySelect('all')}
                sx={{
                  bgcolor: selectedCategory === 'all' ? '#FFD700' : '#F8F9FA',
                  color: selectedCategory === 'all' ? '#333' : '#666',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  height: 36,
                  '&:hover': {
                    bgcolor: selectedCategory === 'all' ? '#FFC107' : '#E9ECEF'
                  }
                }}
              />
            </SwiperSlide>
            {categories.map((category) => (
              <SwiperSlide key={category.id} style={{ width: 'auto' }}>
                <Chip
                  label={`${getCategoryIcon(category.name)} ${category.name}`}
                  onClick={() => handleCategorySelect(category.id)}
                  sx={{
                    bgcolor: selectedCategory === category.id ? '#FFD700' : '#F8F9FA',
                    color: selectedCategory === category.id ? '#333' : '#666',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    height: 36,
                    '&:hover': {
                      bgcolor: selectedCategory === category.id ? '#FFC107' : '#E9ECEF'
                    }
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>

        {/* Popular Food Items */}
        <Box sx={{ mb: 4 }}>
          {displayProducts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Box sx={{ fontSize: '3rem', mb: 2 }}>🍽️</Box>
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                ไม่พบอาหารที่ค้นหา
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                ลองเปลี่ยนหมวดหมู่หรือคำค้นหา
              </Typography>
            </Paper>
          ) : (
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2
              }}
            >
              {displayProducts.map((product, index) => (
                <Card 
                  key={product.id}
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  {/* Food Image */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 120,
                      background: index % 2 === 0 
                        ? 'linear-gradient(135deg, #FF6B6B, #FF8E8E)' 
                        : 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
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
                      <Typography sx={{ fontSize: '3rem' }}>
                        {index % 3 === 0 ? '🍖' : index % 3 === 1 ? '🍝' : '🥗'}
                      </Typography>
                    )}
                    
                    {/* Favorite Button */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(product.id)
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        width: 32,
                        height: 32,
                        '&:hover': { bgcolor: 'white' }
                      }}
                    >
                      {favorites.has(product.id) ? (
                        <FavoriteFilledIcon sx={{ color: '#FF6B6B', fontSize: 18 }} />
                      ) : (
                        <FavoriteIcon sx={{ color: '#999', fontSize: 18 }} />
                      )}
                    </IconButton>
                  </Box>

                  <CardContent sx={{ p: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#333',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#666',
                        display: 'block',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {(product as any).restaurantName || 'ร้านอาหาร'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: '#333',
                          fontSize: '1rem'
                        }}
                      >
                        ฿{product.price}
                      </Typography>
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(product as any)
                        }}
                        size="small"
                        sx={{ 
                          bgcolor: '#FFD700',
                          width: 28,
                          height: 28,
                          '&:hover': { bgcolor: '#FFC107' }
                        }}
                      >
                        <AddIcon sx={{ fontSize: 16, color: '#333' }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Favorite Restaurants */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
              Favorite Restaurants
            </Typography>
            <Button 
              onClick={() => router.push('/restaurant')}
              sx={{ 
                color: '#666',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.9rem'
              }}
            >
              See all
            </Button>
          </Box>

          {restaurants.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Box sx={{ fontSize: '3rem', mb: 2 }}>🏪</Box>
              <Typography variant="body1" sx={{ color: '#666' }}>
                ไม่มีร้านอาหารในขณะนี้
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {restaurants.slice(0, 3).map((restaurant) => (
                <Card 
                  key={restaurant.id}
                  onClick={() => router.push(`/restaurant/${restaurant.slug}`)}
                  sx={{
                    minWidth: 200,
                    borderRadius: 3,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  <Box
                    sx={{
                      height: 100,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
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
                      <RestaurantIcon sx={{ fontSize: '2.5rem', color: 'white' }} />
                    )}
                  </Box>
                  
                  <CardContent sx={{ p: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#333',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {restaurant.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            sx={{ 
                              fontSize: 12, 
                              color: i < Math.floor(restaurant.rating) ? '#FFD700' : '#E0E0E0' 
                            }} 
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                        {restaurant.rating.toFixed(1)}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#999',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block'
                      }}
                    >
                      {restaurant.address || 'Bangkok, Thailand'}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Container>

      <BottomNavbar />
    </Box>
  )
}
