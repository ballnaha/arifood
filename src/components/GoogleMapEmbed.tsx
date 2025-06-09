'use client'

import { Box, Button, Typography } from '@mui/material'
import { Navigation as NavigationIcon } from '@mui/icons-material'

interface GoogleMapEmbedProps {
  latitude: number
  longitude: number
  address?: string
  zoom?: number
  width?: string | number
  height?: string | number
}

export default function GoogleMapEmbed({
  latitude,
  longitude,
  address,
  zoom = 15,
  width = '100%',
  height = 200
}: GoogleMapEmbedProps) {
  
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, '_blank')
  }

  // สร้าง URL ที่แสดงหมุดชัดเจนขึ้น พร้อมข้อความ marker
  const embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=th&z=${zoom}&output=embed`

  return (
    <Box sx={{ width, border: '1px solid #E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
      {/* Map */}
      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Maps"
      />
      
      {/* Info */}
      <Box sx={{ p: 2, bgcolor: '#F8F9FA' }}>
        {address && (
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            📍 {address}
          </Typography>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          พิกัด: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Typography>
        
        <Button
          size="small"
          variant="outlined"
          startIcon={<NavigationIcon />}
          onClick={openInGoogleMaps}
          sx={{
            borderColor: '#4285F4',
            color: '#4285F4',
            '&:hover': {
              borderColor: '#1976D2',
              bgcolor: 'rgba(66, 133, 244, 0.04)'
            }
          }}
          fullWidth
        >
          เปิดใน Google Maps
        </Button>
      </Box>
    </Box>
  )
} 