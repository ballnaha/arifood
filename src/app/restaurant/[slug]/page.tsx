'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useRestaurantDialog } from '@/context/RestaurantDialogContext'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import BottomNavbar from '@/components/BottomNavbar'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Badge
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ShoppingCart as CartIcon,
  Discount as DiscountIcon
} from '@mui/icons-material'

interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  email?: string
  image?: string
  rating: number
  deliveryTime?: string
  owner: {
    name: string
    email: string
  }
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  rating: number
  category: {
    id: string
    name: string
  }
  restaurant: {
    name: string
    slug: string
  }
}

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem, getItemQuantity } = useCartStore()
  const { showDialog } = useRestaurantDialog()
  const { requireAuth } = useRequireAuth()

  useEffect(() => {
    if (params.slug) {
      fetchRestaurantData(params.slug as string)
    }
  }, [params.slug])

  const fetchRestaurantData = async (slug: string) => {
    try {
      // ดึงข้อมูลร้านค้าทั้งหมดแล้วหาจาก slug
      const restaurantsRes = await fetch('/api/restaurants')
      const restaurantsData = await restaurantsRes.json()
      
      const foundRestaurant = restaurantsData.find((r: Restaurant) => r.slug === slug)
      
      if (!foundRestaurant) {
        router.push('/restaurant')
        return
      }

      setRestaurant(foundRestaurant)

      // ดึงข้อมูลอาหารของร้านนี้
      const productsRes = await fetch(`/api/restaurants/${foundRestaurant.id}/products`)
      const productsData = await productsRes.json()
      setProducts(productsData)
      
    } catch (error) {
      console.error('Error fetching restaurant data:', error)
      router.push('/restaurant')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    // ตรวจสอบการ login ก่อนเพิ่มลงตะกร้า
    requireAuth(async () => {
      const restaurantInfo = {
        id: restaurant!.id,
        name: restaurant!.name,
        slug: restaurant!.slug
      };

      const handleRestaurantConflict = (currentRestaurant: string, newRestaurant: string): Promise<boolean> => {
        return new Promise((resolve) => {
          showDialog({
            currentRestaurant,
            newRestaurant,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          });
        });
      };

      const success = await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryName: product.category.name,
        restaurantId: restaurant!.id,
        restaurantName: restaurant!.name,
      }, restaurantInfo, handleRestaurantConflict);

      if (!success) {
        console.log('การเพิ่มสินค้าถูกยกเลิก');
      }
    });
  }

  if (loading) {
    return <LoadingSpinner fullScreen={true} />
  }

  if (!restaurant) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 12 }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 8 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>❌</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
              ไม่พบร้านค้า
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
              ร้านค้าที่คุณค้นหาไม่มีอยู่ในระบบ
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/restaurant')}
              sx={{
                bgcolor: '#FFD700',
                color: '#000',
                fontWeight: 600,
                '&:hover': { bgcolor: '#FFC107' }
              }}
            >
              กลับไปหน้าร้านค้า
            </Button>
          </Box>
        </Container>
        <BottomNavbar />
      </Box>
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
              {restaurant.name}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 0, py: 0 }}>
        {/* Restaurant Cover Image */}
        {restaurant.image && (
          <Box
            sx={{
              width: '100%',
              height: 200,
              backgroundImage: `url(${restaurant.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                p: 3,
                color: 'white'
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {restaurant.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                โดย {restaurant.owner.name}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ px: 2, py: 2 }}>
          {/* Restaurant Info Card */}
          <Card sx={{ borderRadius: 3, mb: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: 3 }}>
              {!restaurant.image && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                    {restaurant.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    โดย {restaurant.owner.name}
                  </Typography>
                </Box>
              )}

              {restaurant.description && (
                <Typography variant="body1" sx={{ color: '#374151', mb: 2, lineHeight: 1.6 }}>
                  {restaurant.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<StarIcon />}
                  label={restaurant.rating.toFixed(1)}
                  sx={{
                    bgcolor: '#FEF3C7',
                    color: '#D97706',
                    fontWeight: 600
                  }}
                />
                {restaurant.deliveryTime && (
                  <Chip
                    icon={<TimeIcon />}
                    label={restaurant.deliveryTime}
                    sx={{
                      bgcolor: '#DCFCE7',
                      color: '#16A34A',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {restaurant.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: '1rem', color: '#6B7280' }} />
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {restaurant.address}
                    </Typography>
                  </Box>
                )}
                {restaurant.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: '1rem', color: '#6B7280' }} />
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {restaurant.phone}
                    </Typography>
                  </Box>
                )}
                {restaurant.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: '1rem', color: '#6B7280' }} />
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      {restaurant.email}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Menu Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
              เมนูอาหาร ({products.length} รายการ)
            </Typography>
          </Box>

          {products.length === 0 ? (
            <Card sx={{ borderRadius: 3, textAlign: 'center', p: 4 }}>
              <Typography sx={{ fontSize: '4rem', mb: 2 }}>🍽️</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
                ยังไม่มีเมนูอาหาร
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                ร้านนี้ยังไม่ได้เพิ่มเมนูอาหาร
              </Typography>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {products.map((product) => {
                const quantity = getItemQuantity(product.id)
                
                return (
                  <Box key={product.id} sx={{ width: 'calc(50% - 8px)' }}>
                    <Card
                      sx={{
                        borderRadius: 3,
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
                      }}
                      onClick={() => router.push(`/restaurant/${restaurant.slug}/product/${product.slug}`)}
                    >
                      <CardMedia
                        sx={{
                          height: 120,
                          position: 'relative',
                          backgroundColor: '#F8F9FA'
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
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2.5rem'
                            }}
                          >
                            🍽️
                          </Box>
                        )}
                        {product.originalPrice && (
                          <Chip
                            icon={<DiscountIcon />}
                            label={`ลด ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: '#EF4444',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 24
                            }}
                          />
                        )}
                      </CardMedia>
                      
                      <CardContent sx={{ p: 2 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#111827',
                            fontSize: '0.9rem',
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
                            color: '#6B7280',
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 1
                          }}
                        >
                          {product.category.name}
                        </Typography>

                        {product.description && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#9CA3AF',
                              fontSize: '0.7rem',
                              display: 'block',
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {product.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Box>
                            {product.originalPrice && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#9CA3AF',
                                  textDecoration: 'line-through',
                                  fontSize: '0.7rem',
                                  display: 'block'
                                }}
                              >
                                ฿{product.originalPrice}
                              </Typography>
                            )}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 700, 
                                color: '#D97706',
                                fontSize: '0.9rem'
                              }}
                            >
                              ฿{product.price}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <StarIcon sx={{ fontSize: '0.8rem', color: '#D97706' }} />
                            <Typography variant="caption" sx={{ color: '#D97706', fontSize: '0.7rem' }}>
                              {product.rating.toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/restaurant/${restaurant.slug}/product/${product.slug}`);
                          }}
                          sx={{
                            bgcolor: '#FFD700',
                            color: '#000',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            borderRadius: 2,
                            py: 1,
                            '&:hover': { bgcolor: '#FFC107' }
                          }}
                        >
                          {quantity > 0 ? (
                            <Badge badgeContent={quantity} color="error">
                              <CartIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                              ดูรายละเอียด
                            </Badge>
                          ) : (
                            'ดูรายละเอียด'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </Box>
                )
              })}
            </Box>
          )}

          {/* Back Button */}
          <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/restaurant')}
              sx={{
                color: '#FFD700',
                borderColor: '#FFD700',
                fontWeight: 600,
                '&:hover': { 
                  borderColor: '#FFC107',
                  backgroundColor: 'rgba(255, 215, 0, 0.04)'
                }
              }}
            >
              ← กลับไปหน้าร้านค้า
            </Button>
          </Box>
        </Box>
      </Container>

      <BottomNavbar />
    </Box>
  )
} 