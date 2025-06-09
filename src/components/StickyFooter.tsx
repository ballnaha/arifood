import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

interface StickyFooterProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  totalPrice: number;
  onAddToCart: () => void;
  isProductActive: boolean;
  isHydrated: boolean;
}

export default function StickyFooter({
  quantity,
  onQuantityChange,
  totalPrice,
  onAddToCart,
  isProductActive,
  isHydrated
}: StickyFooterProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #E5E5E5',
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        {/* Quantity Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#666666' }}>จำนวน</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              size="small"
              sx={{
                bgcolor: quantity <= 1 ? '#F5F5F5' : '#000000',
                color: quantity <= 1 ? '#CCCCCC' : '#FFFFFF',
                width: 32,
                height: 32,
                '&:hover': { 
                  bgcolor: quantity <= 1 ? '#F5F5F5' : '#333333',
                },
                '&.Mui-disabled': { bgcolor: '#F5F5F5', color: '#CCCCCC' },
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            
            <Typography variant="h6" sx={{ fontWeight: 600, minWidth: '30px', textAlign: 'center', color: '#000000' }}>
              {quantity}
            </Typography>
            
            <IconButton
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={!isProductActive}
              size="small"
              sx={{
                bgcolor: isProductActive ? '#000000' : '#F5F5F5',
                color: isProductActive ? '#FFFFFF' : '#CCCCCC',
                width: 32,
                height: 32,
                '&:hover': { 
                  bgcolor: isProductActive ? '#333333' : '#F5F5F5',
                },
                '&.Mui-disabled': { bgcolor: '#F5F5F5', color: '#CCCCCC' },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Total Price & Add Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.8rem' }}>รวมทั้งหมด</Typography>
            <Typography variant="h5" sx={{ color: '#000000', fontWeight: 600 }}>
              ฿{totalPrice.toFixed(2)}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            onClick={onAddToCart}
            disabled={!isProductActive || !isHydrated}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '8px',
              bgcolor: '#000000',
              color: '#FFFFFF',
              textTransform: 'none',
              minWidth: '140px',
              '&:hover': {
                bgcolor: '#333333',
              },
              '&.Mui-disabled': {
                bgcolor: '#F5F5F5',
                color: '#CCCCCC',
              },
            }}
          >
            เพิ่มลงตะกร้า
          </Button>
        </Box>

        {!isProductActive && (
          <Typography variant="body2" sx={{ color: '#DC2626', textAlign: 'center', mt: 2, fontSize: '0.8rem' }}>
            สินค้าชิ้นนี้หมดแล้ว
          </Typography>
        )}
      </Container>
    </Box>
  );
} 