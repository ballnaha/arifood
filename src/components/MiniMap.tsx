'use client'

import { Box, Typography } from '@mui/material'
import { LocationOn as LocationIcon } from '@mui/icons-material'

interface MiniMapProps {
  lat: number
  lng: number
  address?: string
  height?: string
}

export default function MiniMap({ lat, lng, address, height = '150px' }: MiniMapProps) {
  // สร้าง static map URL (ใช้ OpenStreetMap tiles)
  const zoom = 15
  const size = '300x150'
  
  // คำนวณตำแหน่ง marker บนแผนที่
  const markerX = 50 // center
  const markerY = 45 // slightly above center

  return (
    <Box
      sx={{
        height,
        width: '100%',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        position: 'relative',
        overflow: 'hidden',
        background: `
          linear-gradient(45deg, #e8f5e8 25%, #f0f8f0 25%, #f0f8f0 50%, #e8f5e8 50%, #e8f5e8 75%, #f0f8f0 75%),
          linear-gradient(90deg, #ddd 48%, #bbb 50%, #ddd 52%),
          linear-gradient(0deg, #ddd 48%, #bbb 50%, #ddd 52%)
        `,
        backgroundSize: '20px 20px, 60px 60px, 80px 80px',
        backgroundBlendMode: 'normal, overlay, overlay',
      }}
    >
      {/* Street Grid Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 15px,
              rgba(200, 200, 200, 0.3) 15px,
              rgba(200, 200, 200, 0.3) 17px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 15px,
              rgba(200, 200, 200, 0.3) 15px,
              rgba(200, 200, 200, 0.3) 17px
            )
          `,
        }}
      />

      {/* Buildings/Blocks */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '25%',
          height: '30%',
          bgcolor: 'rgba(150, 150, 150, 0.4)',
          borderRadius: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '20%',
          width: '20%',
          height: '40%',
          bgcolor: 'rgba(140, 140, 140, 0.4)',
          borderRadius: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '25%',
          width: '30%',
          height: '25%',
          bgcolor: 'rgba(160, 160, 160, 0.4)',
          borderRadius: 1,
        }}
      />

      {/* Current Location Marker */}
      <Box
        sx={{
          position: 'absolute',
          left: `${markerX}%`,
          top: `${markerY}%`,
          transform: 'translate(-50%, -100%)',
          zIndex: 10,
        }}
      >
        <LocationIcon
          sx={{
            fontSize: 32,
            color: '#ef4444',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        />
      </Box>

      {/* Coordinates Display */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          background: 'rgba(255, 255, 255, 0.95)',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.7rem',
          color: '#333',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </Box>

      {/* Location Label */}
      {address && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            background: 'rgba(255, 255, 255, 0.95)',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#333' }}>
            📍 ตำแหน่งปัจจุบัน
          </Typography>
        </Box>
      )}
    </Box>
  )
} 