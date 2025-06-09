'use client'

import { useEffect, useState } from 'react'
import { CircularProgress, Box } from '@mui/material'
import CustomerRegisterClient from './client'

export default function CustomerRegisterPage() {
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
        <CircularProgress size={40} sx={{ color: '#FFD700' }} />
      </Box>
    )
  }

  return <CustomerRegisterClient />
} 