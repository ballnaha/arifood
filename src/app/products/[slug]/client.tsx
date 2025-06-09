'use client';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Divider,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  Snackbar,
  Alert,
  Paper,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Star as StarIcon,
  ShoppingCart as CartIcon,
  Home as HomeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import Loading from '@/components/Loading';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  originalPrice?: number;
  price: number;
  image?: string | null;
  rating: number;
  isActive: boolean;
  category?: {
    name: string;
    icon: string;
  };
  addOns?: ProductAddOn[];
}

interface ProductAddOn {
  id: string;
  addOn: {
    id: string;
    name: string;
    price: number;
    isActive: boolean;
  };
}

interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

interface ProductClientProps {
  slug: string;
}

export default function ProductClient({ slug }: ProductClientProps) {
  const router = useRouter();
  const { addItem, getItemQuantity, totalItems, _hasHydrated } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with slug:', slug);
        const response = await fetch(`/api/products/${slug}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch product: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Product data:', data);
        setProduct(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: checked
    }));
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    const extraPrice = extraOptions.reduce((total, option) => {
      return selectedOptions[option.id] ? total + option.price : total;
    }, 0);
    
    return (product.price + extraPrice) * quantity;
  };

  const getSelectedExtras = () => {
    return extraOptions.filter(option => selectedOptions[option.id]);
  };

  const handleAddToCart = () => {
    if (!product || !_hasHydrated) return;

    const selectedExtras = getSelectedExtras();
    const extraPrice = selectedExtras.reduce((total, option) => total + option.price, 0);
    
    // เพิ่มสินค้าแค่ครั้งเดียว แต่มี quantity ตามที่เลือก
    const cartItem = {
      id: `${product.id}_${Date.now()}`, // unique ID
      name: product.name,
      price: product.price + extraPrice,
      image: product.image || undefined,
      categoryName: product.category?.name || 'อาหาร',
      instructions: instructions || undefined,
      extras: selectedExtras.length > 0 ? selectedExtras.map(e => e.name).join(', ') : undefined,
    };

    // เพิ่มสินค้าตามจำนวนที่เลือก
    for (let i = 0; i < quantity; i++) {
      addItem(cartItem);
    }

    // รีเซ็ตฟอร์ม
    setQuantity(1);
    setInstructions('');
    setSelectedOptions({});
    
    // แสดง Snackbar สำเร็จ
    setOpenSnackbar(true);
    
    // ไม่ navigate ไปหน้าตะกร้าแล้ว - ให้อยู่หน้าเดิม
  };

  if (loading) {
    return null; // Loading จะแสดงที่ wrapper แล้ว
  }

  if (error || !product) {
    return <Loading text="ไม่พบสินค้านี้" fullScreen />;
  }

  // ได้ add-ons จาก database
  const extraOptions: ExtraOption[] = product?.addOns?.map(addOnRelation => ({
    id: addOnRelation.addOn.id,
    name: addOnRelation.addOn.name,
    price: addOnRelation.addOn.price,
  })) || [];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: '160px', position: 'relative' }}>
      {/* Floating Back Button */}
      <IconButton 
        onClick={() => router.push('/')}
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 20 },
          left: { xs: 16, sm: 20 },
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          color: '#000000',
          width: 44,
          height: 44,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease'
        }}
      >
        <HomeIcon fontSize="small" />
      </IconButton>
      
      {/* Floating Cart Button */}
      <IconButton 
        onClick={() => router.push('/cart')}
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 20 },
          right: { xs: 16, sm: 20 },
          zIndex: 1000,
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          color: '#FFFFFF',
          width: 56,
          height: 56,
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease'
        }}
      >
        <Badge 
          badgeContent={_hasHydrated ? totalItems : 0} 
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#FFD700',
              color: '#000000',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: _hasHydrated ? 'flex' : 'none',
              border: '2px solid #000000',
              minWidth: 22,
              height: 22,
              top: -2,
              right: -2
            }
          }}
        >
          <CartIcon />
        </Badge>
      </IconButton>

      {/* Product Image - Full Width, Top Aligned */}
      <Box
        sx={{
          width: '100%',
          height: { xs: 300, sm: 350, md: 400 },
          backgroundColor: '#F5F5F5',
          position: 'relative',
          cursor: product.image ? 'pointer' : 'default',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: product.image ? 'scale(1.01)' : 'none'
          },
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          mb: 3,
          overflow: 'hidden'
        }}
        onClick={() => {
          if (product.image) {
            setImageDialogOpen(true);
          }
        }}
      >
        {product.image ? (
          <>
            <img 
              src={product.image} 
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.3s ease',
                opacity: imageLoaded ? 1 : 0
              }}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-image') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Loading skeleton */}
            {!imageLoaded && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                '@keyframes loading': {
                  '0%': { backgroundPosition: '200% 0' },
                  '100%': { backgroundPosition: '-200% 0' }
                }
              }} />
            )}
          </>
        ) : null}
        <Box 
          className="fallback-image"
          sx={{ 
            position: product.image ? 'absolute' : 'static',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: product.image ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            color: '#CCCCCC',
            flexDirection: 'column',
            gap: 1
          }}
        >
          🍽️
          <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.8rem' }}>
            ไม่มีรูปภาพ
          </Typography>
        </Box>
        
        {/* Zoom hint */}
        {product.image && imageLoaded && (
          <Box sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.6)',
            color: 'white',
            borderRadius: '4px',
            px: 1,
            py: 0.5,
            fontSize: '0.7rem',
            opacity: 0.8
          }}>
            คลิกเพื่อดูรูปใหญ่
          </Box>
        )}
      </Box>

      <Container maxWidth="sm" sx={{ px: 2 }}>

        {/* Product Info */}
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
              <Box sx={{ textAlign: 'right' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ color: '#DC2626', fontWeight: 600 }}>
                    ฿{product.price.toFixed(2)}
                  </Typography>
                  {product.originalPrice && (
                    <Box sx={{
                      bgcolor: '#FEE2E2',
                      color: '#DC2626',
                      px: 1,
                      py: 0.5,
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Box>
                  )}
                </Box>
                {product.originalPrice && (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textDecoration: 'line-through',
                      color: '#9CA3AF',
                      fontWeight: 500,
                      mt: 0.5
                    }}
                  >
                    ฿{product.originalPrice.toFixed(2)}
                  </Typography>
                )}
              </Box>
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

          {/* Extra Options - แสดงเฉพาะเมื่อมี add-ons */}
          {extraOptions.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>
                  เพิ่มเติม
                </Typography>
                <Box sx={{ bgcolor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '8px', p: 2 }}>
                  <FormGroup>
                    {extraOptions.map((option) => (
                      <FormControlLabel
                        key={option.id}
                        control={
                          <Checkbox
                            checked={selectedOptions[option.id] || false}
                            onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                            sx={{
                              color: '#CCCCCC',
                              '&.Mui-checked': {
                                color: '#000000',
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ 
                            display: 'flex', 
                            width: '100%', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            pr: 0
                          }}>
                            <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.85rem'}}>
                              {option.name}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#666666', 
                              fontWeight: 500, 
                              fontSize: '0.85rem',
                              textAlign: 'right'
                            }}>
                              +฿{option.price}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          width: '100%', 
                          mr: 0, 
                          mb: 0.5,
                          pr: 0,
                          '&:last-child': { mb: 0 },
                          '& .MuiFormControlLabel-label': {
                            width: '100%',
                            pr: 0
                          }
                        }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              </Box>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Custom Instructions */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>
              คำสั่งพิเศษ
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="เช่น ไม่เอาผัก, เผ็ดน้อย, ไม่เอาผงชูรส..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#CCCCCC',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000000',
                    borderWidth: '1px',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#000000',
                  fontSize: '0.9rem',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#999999',
                },
              }}
            />
          </Box>
        </Box>
      </Container>

      {/* Sticky Footer */}
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
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
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
                onClick={() => setQuantity(quantity + 1)}
                disabled={!product?.isActive}
                size="small"
                sx={{
                  bgcolor: product?.isActive ? '#000000' : '#F5F5F5',
                  color: product?.isActive ? '#FFFFFF' : '#CCCCCC',
                  width: 32,
                  height: 32,
                  '&:hover': { 
                    bgcolor: product?.isActive ? '#333333' : '#F5F5F5',
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
                ฿{calculateTotalPrice().toFixed(2)}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleAddToCart}
              disabled={!product?.isActive || !_hasHydrated}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                bgcolor: '#FFD700',
                color: '#000000',
                textTransform: 'none',
                minWidth: '140px',
                '&:hover': {
                  bgcolor: '#FFD700',
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

          {!product?.isActive && (
            <Typography variant="body2" sx={{ color: '#DC2626', textAlign: 'center', mt: 2, fontSize: '0.8rem' }}>
              สินค้าชิ้นนี้หมดแล้ว
            </Typography>
          )}
        </Container>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: '50%',
          '& .MuiSnackbarContent-root': {
            display: 'none'
          }
        }}
      >
        <Box
          sx={{
            bgcolor: '#FFD700',
            color: '#000000',
            px: 3,
            py: 1.5,
            borderRadius: '24px',
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          เพิ่มลงตะกร้าสำเร็จแล้ว!
        </Box>
      </Snackbar>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth={false}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            maxWidth: '90vw',
            maxHeight: '90vh',
            margin: 0,
          },
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }
        }}
      >
        <DialogContent 
          sx={{ 
            p: 0, 
            position: 'relative',
            '&:first-of-type': { pt: 0 }
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => setImageDialogOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.8)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Large Image */}
          {product?.image && (
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              sx={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 