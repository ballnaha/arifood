'use client';
import {
  Box,
  Fab,
  Badge,
  Typography,
  Zoom,
  Card,
  CardContent,
  Divider,
  Slide,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUser } from '@/contexts/UserContext';

export default function FloatingCart() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { items, totalItems, totalPrice, _hasHydrated, checkAuthAndClearIfNeeded } = useCartStore();
  const { requireAuth } = useRequireAuth();
  const { userData } = useUser();
  
  const isLoggedIn = !!userData;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // ตรวจสอบและ clear cart ถ้าไม่ได้ login
    if (mounted && _hasHydrated) {
      checkAuthAndClearIfNeeded();
    }
  }, [mounted, _hasHydrated, isLoggedIn, checkAuthAndClearIfNeeded]);

  const handleCartClick = () => {
    if (totalItems > 0) {
      setShowPreview(!showPreview);
    } else {
      requireAuth(() => {
        router.push('/cart');
      });
    }
  };

  const handleBalloonClick = () => {
    requireAuth(() => {
      setShowPreview(false);
      router.push('/cart');
    });
  };

  if (!mounted || !_hasHydrated) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <Zoom in={true} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 90, sm: 90 },
            right: { xs: 16, sm: 20 },
            zIndex: 1300,
          }}
        >
          <Fab
            onClick={handleCartClick}
            size="medium"
            sx={{
              bgcolor: '#FFD700',
              color: '#000000',
              width: 56,
              height: 56,
              boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
              border: 'none',
              '&:hover': {
                bgcolor: '#E6C200',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Badge 
              badgeContent={totalItems || undefined} 
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  right: -6,
                  top: -6,
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                  border: '2px solid #ffffff',
                  animation: totalItems > 0 ? 'pulse 2s infinite' : 'none',
                }
              }}
            >
              <CartIcon sx={{ fontSize: '1.3rem' }} />
            </Badge>
          </Fab>
        </Box>
      </Zoom>

      {/* Cart Preview Balloon */}
      <Slide direction="up" in={showPreview} mountOnEnter unmountOnExit>
        <Card
          onClick={handleBalloonClick}
          sx={{
            position: 'fixed',
            bottom: { xs: 160, sm: 160 },
            right: { xs: 16, sm: 20 },
            width: { xs: '280px', sm: '320px' },
            maxHeight: '50vh',
            zIndex: 1300,
            borderRadius: '16px',
            bgcolor: '#ffffff',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid #FFD700',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              right: 35,
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #FFD700',
              zIndex: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -7,
              right: 36,
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #ffffff',
              zIndex: 2,
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box sx={{ 
              p: 2,
              bgcolor: '#FFD700',
              color: '#000000'
            }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ textAlign: 'center' }}>
                ตะกร้าสินค้า ({totalItems} รายการ)
              </Typography>
            </Box>

            {/* Cart Items Preview */}
            <Box sx={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#FFD700',
                borderRadius: '2px',
              },
            }}>
              {items.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary" variant="body2">
                    ตะกร้าว่างเปล่า
                  </Typography>
                </Box>
              ) : (
                items.slice(0, 5).map((item, index) => (
                  <Box key={item.id}>
                    <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          fontWeight={500} 
                          sx={{ 
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          ฿{item.price.toLocaleString()} × {item.quantity}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        fontWeight={600} 
                        sx={{ 
                          fontSize: '0.8rem',
                          color: '#FFD700',
                          ml: 1
                        }}
                      >
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                    {index < Math.min(items.length - 1, 4) && <Divider />}
                  </Box>
                ))
              )}
              
              {/* Show more indicator */}
              {items.length > 5 && (
                <Box sx={{ px: 2, py: 1, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                  <Typography variant="caption" color="text.secondary">
                    และอีก {items.length - 5} รายการ...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            {items.length > 0 && (
              <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>
                    รวมทั้งหมด
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#000000">
                    ฿{totalPrice.toLocaleString()}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    textAlign: 'center',
                    mt: 1,
                    color: 'text.secondary'
                  }}
                >
                  คลิกเพื่อดูตะกร้าเต็ม
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Slide>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
} 