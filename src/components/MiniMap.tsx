'use client'

import { Box, Typography } from '@mui/material'
import { LocationOn as LocationIcon } from '@mui/icons-material'

interface MiniMapProps {
  lat: number
  lng: number
  address?: string
  height?: string
}

export default function MiniMap({ lat, lng, address, height = '200px' }: MiniMapProps) {
  const zoom = 15
  
  // สร้าง Google Maps embed URL (ไม่ต้องใช้ API key)
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=&q=${lat},${lng}&zoom=${zoom}`
  
  // สร้าง OpenStreetMap URL สำรับ fallback
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`

  return (
    <Box
      sx={{
        height,
        width: '100%',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f5f5f5'
      }}
    >
      {/* Google Maps Embed */}
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: '8px' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`}
        title="Google Map"
        onError={(e) => {
          // หาก Google Maps ไม่โหลด ใช้ OpenStreetMap
          const iframe = e.target as HTMLIFrameElement
          iframe.src = osmUrl
        }}
      />

      {/* Overlay สำหรับข้อมูลตำแหน่ง */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          px: 2,
          py: 1,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <LocationIcon sx={{ fontSize: 16, color: '#ef4444' }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>
            ตำแหน่งปัจจุบัน
          </Typography>
        </Box>
        
        {address && (
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666', display: 'block', mb: 0.5 }}>
            {address.length > 60 ? `${address.substring(0, 60)}...` : address}
          </Typography>
        )}
        
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#999' }}>
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </Typography>
      </Box>

      {/* ปุ่มเปิดใน Google Maps */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <Box
          component="a"
          href={`https://www.google.com/maps?q=${lat},${lng}&z=${zoom}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            fontSize: '0.7rem',
            color: '#1976d2',
            textDecoration: 'none',
            fontWeight: 600,
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }
          }}
        >
          🗺️ เปิดแผนที่
        </Box>
      </Box>
    </Box>
  )
} 