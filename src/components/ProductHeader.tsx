import { Box, Typography, Chip } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  rating: number;
  isActive: boolean;
  category?: {
    name: string;
    icon: string;
  };
}

interface ProductHeaderProps {
  product: Product;
}

export default function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <Box sx={{ mb: 2 }}>
      {/* Product Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#000000' }}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            label={product.category?.name || 'อาหาร'}
            size="small"
            sx={{ 
              bgcolor: '#F5F5F5', 
              color: '#666666',
              fontSize: '0.8rem'
            }}
          />
          <Typography variant="h4" sx={{ color: '#000000', fontWeight: 600 }}>
            ฿{product.price.toFixed(2)}
          </Typography>
        </Box>
        {!product.isActive && (
          <Chip 
            label="หมด" 
            size="small" 
            sx={{ 
              color: '#DC2626', 
              bgcolor: '#FEF2F2',
              fontWeight: 500
            }} 
          />
        )}
      </Box>

      <Typography variant="body1" sx={{ color: '#666666', mb: 3, lineHeight: 1.6 }}>
        {product.description || 'ไม่มีคำอธิบาย'}
      </Typography>

      {/* Product Rating */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3 }}>
        <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#666666' }}>
          {product.rating}
        </Typography>
      </Box>
    </Box>
  );
} 