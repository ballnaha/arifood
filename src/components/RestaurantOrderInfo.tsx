'use client'

import { Alert, AlertTitle, Box, Typography } from '@mui/material'

interface RestaurantOrderInfoProps {
  restaurantName?: string
  show?: boolean
}

export default function RestaurantOrderInfo({ restaurantName, show = true }: RestaurantOrderInfoProps) {
  if (!show) return null

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <AlertTitle sx={{ fontWeight: 600 }}>
          📍 หลักการสั่งอาหาร
        </AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • สั่งอาหารได้เฉพาะจากร้านเดียวเท่านั้น
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • หากต้องการเปลี่ยนร้าน ต้องล้างตะกร้าก่อน
        </Typography>
        {restaurantName && (
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
            กำลังสั่งจากร้าน: {restaurantName}
          </Typography>
        )}
      </Alert>
    </Box>
  )
} 