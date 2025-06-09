'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material'
import { Restaurant } from '@mui/icons-material'

interface RestaurantChangeDialogProps {
  open: boolean
  currentRestaurant?: string
  newRestaurant?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function RestaurantChangeDialog({
  open,
  currentRestaurant,
  newRestaurant,
  onConfirm,
  onCancel
}: RestaurantChangeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: '400px'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 1
        }}>
          <Restaurant sx={{ fontSize: 40, color: 'warning.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            เปลี่ยนร้านค้า?
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', px: 3 }}>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          คุณมีอาหารจากร้านอื่นอยู่ในตะกร้าแล้ว
        </Typography>

        <Box sx={{ 
          bgcolor: 'grey.50', 
          borderRadius: 2, 
          p: 2, 
          mb: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            ร้านปัจจุบันในตะกร้า:
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
            🏪 {currentRestaurant}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            ร้านที่ต้องการเพิ่ม:
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>
            🏪 {newRestaurant}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
          ⚠️ การดำเนินการนี้จะลบอาหารทั้งหมดในตะกร้า
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          fullWidth
          sx={{
            py: 1.5,
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: 'grey.50'
            }
          }}
        >
          ยกเลิก
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          fullWidth
          color="warning"
          sx={{
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'warning.dark'
            }
          }}
        >
          เปลี่ยนร้าน
        </Button>
      </DialogActions>
    </Dialog>
  )
} 