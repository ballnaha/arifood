 'use client'

import { useState } from 'react'
import { Button, CircularProgress, Box } from '@mui/material'
import { useCartStore } from '@/store/cartStore'
import { useRequireAuth } from '@/hooks/useRequireAuth'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
    categoryName: string
    restaurantId?: string
    restaurantName?: string
  }
  restaurant?: {
    id: string
    name: string
    slug: string
  }
  children?: React.ReactNode
  variant?: 'contained' | 'outlined' | 'text'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
}

export default function AddToCartButton({
  product,
  restaurant,
  children = 'เพิ่มลงตะกร้า',
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const { addItem, getItemQuantity } = useCartStore()
  const { requireAuth } = useRequireAuth()
  
  const quantity = getItemQuantity(product.id)

  const handleClick = async () => {
    if (disabled || loading) return
    
    // ตรวจสอบการ login ก่อนเพิ่มลงตะกร้า
    requireAuth(async () => {
      setLoading(true)
      
      try {
        const success = await addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          categoryName: product.categoryName,
          restaurantId: product.restaurantId,
          restaurantName: product.restaurantName,
        }, restaurant)

        if (success && onClick) {
          onClick()
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={handleClick}
      sx={{
        position: 'relative',
        ...(variant === 'contained' && {
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          }
        })
      }}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            color: variant === 'contained' ? 'primary.contrastText' : 'primary.main',
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: '-10px',
            marginTop: '-10px',
          }}
        />
      )}
      <Box sx={{ opacity: loading ? 0 : 1 }}>
        {quantity > 0 ? `เพิ่มอีก (${quantity} ในตะกร้า)` : children}
      </Box>
    </Button>
  )
}