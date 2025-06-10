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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress
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
import RestaurantOrderInfo from '@/components/RestaurantOrderInfo';
import { useState } from 'react';

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

export default function CartClient() {
  const router = useRouter();
  const { items, restaurant, totalItems, totalPrice, removeItem, clearCart } = useCartStore();
  
  // States for order process
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input changes
  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle order submission
  const handlePlaceOrder = async () => {
    if (!restaurant || items.length === 0) return;

    // Validate customer info
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        customerInfo,
        restaurantId: restaurant.id,
        items: items.map(item => ({
          productId: item.id.split('_')[0], // Extract product ID from cart item ID
          quantity: item.quantity,
          price: item.price,
          instructions: item.instructions
        })),
        subtotalAmount: totalPrice,
        deliveryFee: 30,
        totalAmount: totalPrice + 30,
        paymentMethod: 'CASH',
        specialInstructions: ''
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      
      if (result.success) {
        // Clear cart
        clearCart();
        
        // Close dialog
        setShowOrderDialog(false);
        
        // Show success message
        setShowSuccess(true);
        
        // Redirect to orders page after delay
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setErrorMessage('เกิดข้อผิดพลาดในการสั่งอาหาร กรุณาลองใหม่อีกครั้ง');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

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
        <Container maxWidth="sm" sx={{ px: 2, py: 8, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            ตะกร้าสินค้าว่างเปล่า
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            เพิ่มอาหารลงในตะกร้าเพื่อทำการสั่งซื้อ
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
            sx={{ borderRadius: '12px' }}
          >
            เลือกร้านอาหาร
          </Button>
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
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                ตะกร้าสินค้า ({totalItems} รายการ)
              </Typography>
              {restaurant && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                  จาก {restaurant.name}
                </Typography>
              )}
            </Box>
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
        {/* Restaurant Info */}
        <RestaurantOrderInfo restaurantName={restaurant?.name} />
        
        {/* Cart Items */}
        <SwipeableList type={ListType.IOS}>
          {items.map((item) => {
            const itemTrailingActions = (
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
                trailingActions={itemTrailingActions}
                className="swipe-item"
              >
                <Box sx={{ py: 1 }}>
                  <Card sx={{ 
                    borderRadius: '16px',
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: 1
                    }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Image */}
                        {item.image && (
                          <Box sx={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: '12px', 
                            overflow: 'hidden',
                            flexShrink: 0,
                            bgcolor: 'grey.100'
                          }}>
                            <img 
                              src={item.image} 
                              alt={item.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </Box>
                        )}

                        {/* Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* Name */}
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }}>
                            {item.name}
                          </Typography>

                          {/* Category */}
                          <Typography variant="caption" sx={{ 
                            color: '#888888', 
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 1
                          }}>
                            {item.categoryName}
                          </Typography>

                          {/* Extras */}
                          {item.extras && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="caption" sx={{ color: '#888888', fontWeight: 500, display: 'block', mb: 0.5 }}>
                                เพิ่มเติม:
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
        <Card sx={{ borderRadius: '16px', mt: 3 }}>
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
              onClick={() => setShowOrderDialog(true)}
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

      {/* Order Dialog */}
      <Dialog 
        open={showOrderDialog} 
        onClose={() => setShowOrderDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          ข้อมูลการสั่งซื้อ
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="ชื่อผู้สั่ง"
              value={customerInfo.name}
              onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="เบอร์โทรศัพท์"
              value={customerInfo.phone}
              onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="ที่อยู่จัดส่ง"
              value={customerInfo.address}
              onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
              margin="normal"
              multiline
              rows={3}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowOrderDialog(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePlaceOrder}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'กำลังสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          สั่งอาหารสำเร็จ! ร้านอาหารได้รับการแจ้งเตือนแล้ว
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <BottomNavbar />
    </Box>
  );
} 