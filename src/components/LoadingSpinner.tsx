'use client'

import { Box, Typography, Container } from '@mui/material'

interface LoadingSpinnerProps {
  message?: string
  fullScreen?: boolean
  showBottomNavbar?: boolean
}

export default function LoadingSpinner({ 
  message = 'กำลังโหลด...', 
  fullScreen = false,
  showBottomNavbar = false 
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Box sx={{ 
        width: 40, 
        height: 40, 
        margin: '0 auto', 
        borderRadius: '50%', 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #FFD700',
        animation: 'spin 1s linear infinite'
      }} />
      <Typography variant="body1" sx={{ mt: 2, color: '#666' }}>
        {message}
      </Typography>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  )

  if (fullScreen) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: showBottomNavbar ? 12 : 0 }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
          {spinnerContent}
        </Container>
      </Box>
    )
  }

  return spinnerContent
} 