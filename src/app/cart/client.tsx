'use client';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import BottomNavbar from '@/components/BottomNavbar';
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

export default function CartClient() {
  const router = useRouter();
  const { items, totalItems, totalPrice, removeItem, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pb: 12 }}>
        {/* Header */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => router.back()}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                ตะกร้าสินค้า
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Empty Cart */}
        <Container maxWidth="sm" sx={{ px: 2, py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ตะกร้าของคุณว่างเปล่า
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              เริ่มเลือกสินค้าที่คุณชอบกันเลย
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              sx={{ px: 4 }}
            >
              เริ่มช้อปปิ้ง
            </Button>
          </Box>
        </Container>

        <BottomNavbar />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pb: 12 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
              ตะกร้าสินค้า ({totalItems} รายการ)
            </Typography>
            <Button
              size="small"
              color="error"
              onClick={clearCart}
              sx={{ fontSize: '0.75rem' }}
            >
              ลบทั้งหมด
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        {/* Cart Items */}
        <SwipeableList type={ListType.IOS}>
          {items.map((item) => {
            const trailingActions = () => (
              <TrailingActions>
                <SwipeAction
                  onClick={() => removeItem(item.id)}
                  Tag="div"
                >
                  <Box sx={{ 
                    backgroundColor: '#DC2626',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    borderRadius: '0 16px 16px 0',
                    minWidth: '80px',
                    height: '100%',
                    flexDirection: 'column',
                    gap: 0.5
                  }}>
                    <DeleteIcon fontSize="small" />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                      ลบ
                    </Typography>
                  </Box>
                </SwipeAction>
              </TrailingActions>
            );

            return (
              <SwipeableListItem
                key={item.id}
                trailingActions={trailingActions()}
              >
                <Box sx={{ mb: 1, width: '100%' }}>
                  <Card sx={{ 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #F0F0F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      borderColor: '#E0E0E0'
                    }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Product Image */}
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            position: 'relative',
                            backgroundColor: '#F8F9FA',
                          }}
                        >
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <Box sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2.5rem',
                              color: '#CCCCCC'
                            }}>
                              🍽️
                            </Box>
                          )}
                          
                          
                        </Box>

                        {/* Product Info */}
                        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ color: '#1A1A1A', lineHeight: 1.3 }}>
                              {item.name}
                            </Typography>
                          </Box>
                          
                          {/* Add-ons */}
                          {item.extras && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" sx={{ color: '#888888', fontWeight: 500, display: 'block', mb: 0.5 }}>
                                เพิ่มเติม:
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#4A90E2', 
                                fontSize: '0.9rem',
                                bgcolor: '#F0F7FF',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                display: 'inline-block'
                              }}>
                                {item.extras}
                              </Typography>
                            </Box>
                          )}

                          {/* Instructions */}
                          {item.instructions && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" sx={{ color: '#888888', fontWeight: 500, display: 'block', mb: 0.5 }}>
                                คำสั่งพิเศษ:
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: '#666666', 
                                fontSize: '0.9rem',
                                fontStyle: 'italic',
                                bgcolor: '#FAFAFA',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                display: 'inline-block'
                              }}>
                                {item.instructions}
                              </Typography>
                            </Box>
                          )}

                          {/* Price */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#888888' }}>
                              ฿{item.price.toFixed(2)} × {item.quantity}
                            </Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#1A1A1A' }}>
                              ฿{(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </SwipeableListItem>
            );
          })}
        </SwipeableList>

        {/* Summary */}
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              สรุปคำสั่งซื้อ
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">รวม ({totalItems} รายการ)</Typography>
              <Typography variant="body2">฿{totalPrice.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">ค่าจัดส่ง</Typography>
              <Typography variant="body2">฿30.00</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>รวมทั้งสิ้น</Typography>
              <Typography variant="h6" fontWeight={600}>
                ฿{(totalPrice + 30).toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '12px',
              }}
            >
              สั่งซื้อ
            </Button>
          </CardContent>
        </Card>
      </Container>

      <BottomNavbar />
    </Box>
  );
} 