'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useRestaurantDialog } from '@/context/RestaurantDialogContext'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  Box,
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Star as StarIcon,
} from '@mui/icons-material'

interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
  rating: number
  deliveryTime?: string
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
    id: string
    name: string
    slug: string
  }
}

interface AddOn {
  id: string
  name: string
  price: number
  description?: string
}

// Mock add-ons data
const mockAddOns: AddOn[] = [
  { id: '1', name: 'เพิ่มไข่ดาว', price: 15, description: 'ไข่ดาวสดใหม่' },
  { id: '2', name: 'เพิ่มหมูสับ', price: 25, description: 'หมูสับเนื้อแท้' },
  { id: '3', name: 'เพิ่มผัก', price: 10, description: 'ผักสดใหม่' },
  { id: '4', name: 'เพิ่มเผ็ด', price: 0, description: 'ปรับความเผ็ดให้มากขึ้น' },
  { id: '5', name: 'เพิ่มข้าว', price: 10, description: 'ข้าวสวยหอมมะลิ' },
  { id: '6', name: 'เพิ่มน้ำจิ้ม', price: 5, description: 'น้ำจิ้มรสเด็ด' },
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  const { addItem } = useCartStore()
  const { showDialog } = useRestaurantDialog()

  useEffect(() => {
    if (params.slug && params.productSlug) {
      fetchProductData(params.slug as string, params.productSlug as string)
    }
  }, [params.slug, params.productSlug])

  const fetchProductData = async (restaurantSlug: string, productSlug: string) => {
    try {
      // ดึงข้อมูลร้านค้า
      const restaurantsRes = await fetch('/api/restaurants')
      const restaurantsData = await restaurantsRes.json()
      
      const foundRestaurant = restaurantsData.find((r: Restaurant) => r.slug === restaurantSlug)
      
      if (!foundRestaurant) {
        router.push('/restaurant')
        return
      }

      setRestaurant(foundRestaurant)

      // ดึงข้อมูลอาหาร
      const productsRes = await fetch(`/api/restaurants/${foundRestaurant.id}/products`)
      const productsData = await productsRes.json()
      
      const foundProduct = productsData.find((p: Product) => p.slug === productSlug)
      
      if (!foundProduct) {
        router.push(`/restaurant/${restaurantSlug}`)
        return
      }

      setProduct(foundProduct)
      
    } catch (error) {
      console.error('Error fetching product data:', error)
      router.push('/restaurant')
    } finally {
      setLoading(false)
    }
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    )
  }

  const calculateTotal = () => {
    const basePrice = product?.price || 0
    const addOnsPrice = selectedAddOns.reduce((sum, addOnId) => {
      const addOn = mockAddOns.find(a => a.id === addOnId)
      return sum + (addOn?.price || 0)
    }, 0)
    
    return (basePrice + addOnsPrice) * quantity
  }

  const handleAddToCart = async () => {
    if (!product || !restaurant) return

    const restaurantInfo = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug
    }

    const selectedAddOnsList = selectedAddOns.map(id => 
      mockAddOns.find(addOn => addOn.id === id)
    ).filter(Boolean)

    const extrasText = selectedAddOnsList.length > 0 
      ? selectedAddOnsList.map(addOn => addOn!.name).join(', ')
      : undefined

    const fullNote = [note, extrasText].filter(Boolean).join(' | ')

    const handleRestaurantConflict = (currentRestaurant: string, newRestaurant: string): Promise<boolean> => {
      return new Promise((resolve) => {
        showDialog({
          currentRestaurant,
          newRestaurant,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        })
      })
    }

    // เพิ่มสินค้าตามจำนวนที่เลือก
    for (let i = 0; i < quantity; i++) {
      const success = await addItem({
        id: `${product.id}-${Date.now()}-${i}`, // สร้าง unique ID
        name: product.name,
        price: product.price + selectedAddOns.reduce((sum, addOnId) => {
          const addOn = mockAddOns.find(a => a.id === addOnId)
          return sum + (addOn?.price || 0)
        }, 0),
        image: product.image,
        categoryName: product.category.name,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        instructions: fullNote || undefined,
        extras: extrasText
      }, restaurantInfo, handleRestaurantConflict)

      if (!success) {
        console.log('การเพิ่มสินค้าถูกยกเลิก')
        return
      }
    }

    setShowSuccess(true)
    
    // รีเซ็ตฟอร์ม
    setQuantity(1)
    setSelectedAddOns([])
    setNote('')
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LoadingSpinner />
      </Container>
    )
  }

  if (!product || !restaurant) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            ไม่พบข้อมูลอาหาร
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/restaurant')}
            sx={{ mt: 2 }}
          >
            กลับไปหน้าร้านค้า
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => router.push(`/restaurant/${restaurant.slug}`)}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {restaurant.name}
          </Typography>
        </Box>
      </Box>

      {/* Product Image & Info */}
      <Card sx={{ mb: 3 }}>
        {product.image && (
          <CardMedia
            component="img"
            height="250"
            image={product.image}
            alt={product.name}
            sx={{ objectFit: 'cover' }}
          />
        )}
        
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {product.name}
              </Typography>
              <Chip 
                label={product.category.name} 
                size="small" 
                color="primary" 
                sx={{ mb: 1 }}
              />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              {product.originalPrice && (
                <Typography 
                  variant="body2" 
                  sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                >
                  ฿{product.originalPrice}
                </Typography>
              )}
              <Typography variant="h5" fontWeight={700} color="primary">
                ฿{product.price}
              </Typography>
            </Box>
          </Box>

          {product.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {product.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
            <Typography variant="body2">
              {product.rating.toFixed(1)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Quantity Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          จำนวน
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            sx={{ bgcolor: '#f5f5f5' }}
          >
            <RemoveIcon />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: '40px', textAlign: 'center' }}>
            {quantity}
          </Typography>
          <IconButton 
            onClick={() => setQuantity(quantity + 1)}
            sx={{ bgcolor: '#f5f5f5' }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Add-ons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          เพิ่มเติม (Add-ons)
        </Typography>
        <FormGroup>
          {mockAddOns.map((addOn) => (
            <FormControlLabel
              key={addOn.id}
              control={
                <Checkbox
                  checked={selectedAddOns.includes(addOn.id)}
                  onChange={() => handleAddOnToggle(addOn.id)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                  <Box>
                    <Typography variant="body1">
                      {addOn.name}
                    </Typography>
                    {addOn.description && (
                      <Typography variant="caption" color="text.secondary">
                        {addOn.description}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {addOn.price > 0 ? `+฿${addOn.price}` : 'ฟรี'}
                  </Typography>
                </Box>
              }
              sx={{ 
                mb: 1,
                mx: 0,
                '& .MuiFormControlLabel-label': {
                  width: '100%'
                }
              }}
            />
          ))}
        </FormGroup>
      </Paper>

      {/* Note */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          หมายเหตุ
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น ไม่เอาผัก, เอาน้อยเกลือ, เผ็ดน้อย..."
          variant="outlined"
        />
      </Paper>

      {/* Order Summary */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f9f9f9' }}>
        <Typography variant="h6" gutterBottom>
          สรุปการสั่งซื้อ
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>
              {product.name} × {quantity}
            </Typography>
            <Typography>
              ฿{(product.price * quantity).toLocaleString()}
            </Typography>
          </Box>
          
          {selectedAddOns.length > 0 && (
            <Box sx={{ ml: 2, mb: 1 }}>
              {selectedAddOns.map(addOnId => {
                const addOn = mockAddOns.find(a => a.id === addOnId)
                return addOn ? (
                  <Box key={addOnId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      + {addOn.name} × {quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ฿{(addOn.price * quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ) : null
              })}
            </Box>
          )}
          
          {note && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              หมายเหตุ: {note}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            รวมทั้งหมด
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            ฿{calculateTotal().toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      {/* Add to Cart Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleAddToCart}
        sx={{
          py: 2,
          fontSize: '1.1rem',
          fontWeight: 600,
          bgcolor: '#FFD700',
          color: '#000000',
          '&:hover': {
            bgcolor: '#E6C200'
          }
        }}
      >
        เพิ่มลงตะกร้า - ฿{calculateTotal().toLocaleString()}
      </Button>

      {/* Success Message */}
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
          เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว!
        </Alert>
      </Snackbar>
    </Container>
  )
} 