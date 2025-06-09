'use client'

import { useEffect, useState } from 'react'
import { CircularProgress, Box } from '@mui/material'
import RestaurantRegisterClient from './client'

export default function RestaurantRegisterPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#FAFAFA' 
      }}>
        <CircularProgress size={40} sx={{ color: '#FF9800' }} />
      </Box>
    )
  }

  return <RestaurantRegisterClient />
}