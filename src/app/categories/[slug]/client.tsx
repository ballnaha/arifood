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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRestaurantDialog } from '@/context/RestaurantDialogContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import Loading from '@/components/Loading';
import BottomNavbar from '@/components/BottomNavbar';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  rating: number;
  category: {
    name: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  products: Product[];
}

interface CategoryClientProps {
  slug: string;
}

export default function CategoryClient({ slug }: CategoryClientProps) {
  const router = useRouter();
  const { addItem, getItemQuantity } = useCartStore();
  const { showDialog } = useRestaurantDialog();
  const { requireAuth } = useRequireAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }
        const data = await response.json();
        setCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  const handleAddToCart = async (product: Product) => {
    // ตรวจสอบการ login ก่อนเพิ่มลงตะกร้า
    requireAuth(async () => {
      const handleRestaurantConflict = (currentRestaurant: string, newRestaurant: string): Promise<boolean> => {
        return new Promise((resolve) => {
          showDialog({
            currentRestaurant,
            newRestaurant,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          });
        });
      };

      const success = await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryName: product.category.name,
      }, undefined, handleRestaurantConflict);

      if (!success) {
        console.log('การเพิ่มสินค้าถูกยกเลิก');
      }
    });
  };

  if (loading) {
    return null; // Loading จะแสดงที่ wrapper แล้ว
  }

  if (error || !category) {
    return <Loading text="ไม่พบหมวดหมู่นี้" fullScreen />;
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                {category.icon}
              </Typography>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          พบ {category.products.length} รายการ
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {category.products.map((product) => {
            const quantity = mounted ? getItemQuantity(product.id) : 0;
            
            return (
              <Box key={product.id}>
                <Card
                  sx={{
                    display: 'flex',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                    },
                  }}
                  onClick={() => router.push(`/products/${product.slug}`)}
                >
                  <Box
                    sx={{
                      width: { xs: 80, sm: 100, md: 120 },
                      height: { xs: 80, sm: 100, md: 120 },
                      backgroundColor: '#F8F9FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px 0 0 12px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.opacity = '1';
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, opacity: 0.7 }}>
                        🍽️
                      </Typography>
                    )}
                  </Box>
                  <CardContent sx={{ flex: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={600}>
                        ฿{product.price.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                      {product.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {product.rating}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {mounted && quantity > 0 && (
                          <Chip
                            label={`${quantity} ชิ้น`}
                            size="small"
                            color="primary"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>

        {category.products.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ยังไม่มีสินค้าในหมวดหมู่นี้
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              sx={{ mt: 2 }}
            >
              กลับหน้าแรก
            </Button>
          </Box>
        )}
      </Container>

      <BottomNavbar />
    </Box>
  );
} 