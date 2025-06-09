'use client';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  InputBase,
  Grid,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  ShoppingCart as CartIcon,
  AccountCircle as AccountCircleIcon,
  Restaurant as RestaurantIcon,
  RestaurantTwoTone as RestaurantTwoToneIcon,
  RamenDining as RamenDiningIcon,
  Storefront as StorefrontIcon,
  LocalCafe as LocalCafeIcon,
  LocalCafeTwoTone as LocalCafeTwoToneIcon,
  Cake as CakeIcon,
  CakeTwoTone as CakeTwoToneIcon,
  LocalDining as LocalDiningIcon,
  RoomService as RoomServiceIcon,
  RoomServiceTwoTone as RoomServiceTwoToneIcon,
} from '@mui/icons-material'; 
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import Loading from '@/components/Loading';
import BottomNavbar from '@/components/BottomNavbar';
import ClientOnly from '@/components/ClientOnly';
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  width: '100%',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '14px 16px',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#D0D0D0',
  },
  '&:focus-within': {
    borderColor: '#6B7280',
    boxShadow: '0 0 0 3px rgba(107, 114, 128, 0.1)',
  },
  '& .MuiInputBase-input': {
    padding: 0,
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
    },
  },
}));

const CategoryButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '60px',
  height: '80px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  marginBottom: '4px',
}));

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #F3F4F6',
  boxShadow: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: '#E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
}));

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  _count: { products: number };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  originalPrice?: number;
  price: number;
  rating: number;
  image?: string;
  category: {
    name: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // เก็บสินค้าทั้งหมด
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true); // เริ่มต้นเป็น true เพื่อแสดง skeleton ทันที
  const { addItem, getItemQuantity, totalItems } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ]);
        
        const categoriesData = await categoriesRes.json();
        const productsData = await productsRes.json();
        
        setCategories(categoriesData);
        setAllProducts(productsData); // เก็บสินค้าทั้งหมด
        setProducts(productsData); // แสดงสินค้าทั้งหมด
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categoryName: product.category.name,
    });
  };

  // ฟังก์ชันแมป category icon
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'กิมจิ': <RestaurantTwoToneIcon sx={{ 
        fontSize: 24, 
        color: '#FF6B6B',
        filter: 'drop-shadow(0 2px 4px rgba(255, 107, 107, 0.2))',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          filter: 'drop-shadow(0 4px 8px rgba(255, 107, 107, 0.3))',
        }
      }} />,
      'อาหารคาว': <RoomServiceTwoToneIcon sx={{ 
        fontSize: 24, 
        color: '#4ECDC4',
        filter: 'drop-shadow(0 2px 4px rgba(78, 205, 196, 0.2))',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          filter: 'drop-shadow(0 4px 8px rgba(78, 205, 196, 0.3))',
        }
      }} />,     
      'เครื่องดื่ม': <LocalCafeTwoToneIcon sx={{ 
        fontSize: 24, 
        color: '#45B7D1',
        filter: 'drop-shadow(0 2px 4px rgba(69, 183, 209, 0.2))',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          filter: 'drop-shadow(0 4px 8px rgba(69, 183, 209, 0.3))',
        }
      }} />,
      'ขนมหวาน': <CakeTwoToneIcon sx={{ 
        fontSize: 24, 
        color: '#F7B731',
        filter: 'drop-shadow(0 2px 4px rgba(247, 183, 49, 0.2))',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          filter: 'drop-shadow(0 4px 8px rgba(247, 183, 49, 0.3))',
        }
      }} />,
    };
    
    return iconMap[categoryName] || <RestaurantTwoToneIcon sx={{ 
      fontSize: 24, 
      color: '#6B7280',
      filter: 'drop-shadow(0 2px 4px rgba(107, 114, 128, 0.2))',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'scale(1.1)',
        filter: 'drop-shadow(0 4px 8px rgba(107, 114, 128, 0.3))',
      }
    }} />;
  };

  // ฟังก์ชันค้นหา
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.trim().length > 0);
    
    if (query.trim().length === 0) {
      setProducts(allProducts);
      return;
    }

    const filteredProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setProducts(filteredProducts);
  };

  // ฟังก์ชันล้างการค้นหา
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setProducts(allProducts);
  };

  const categoryColors = [
    '#F3F4F6', // Light Gray
    '#F9FAFB', // Very Light Gray
    '#F3F4F6', // Light Gray
    '#F9FAFB', // Very Light Gray
    '#F3F4F6', // Light Gray
  ];

  // Skeleton Components
  const HeaderSkeleton = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          backgroundColor: '#F0F0F0', 
          borderRadius: '50%',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite'
        }} />
        <div>
          <div style={{ 
            width: '140px', 
            height: '24px', 
            backgroundColor: '#F0F0F0', 
            borderRadius: '4px', 
            marginBottom: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite'
          }} />
          <div style={{ 
            width: '120px', 
            height: '16px', 
            backgroundColor: '#F0F0F0', 
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite'
          }} />
        </div>
      </div>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        backgroundColor: '#F0F0F0', 
        borderRadius: '50%',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s infinite'
      }} />
    </div>
  );

  const SearchSkeleton = () => (
    <div style={{ 
      width: '100%', 
      height: '56px', 
      backgroundColor: '#F0F0F0', 
      borderRadius: '8px', 
      marginBottom: '32px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite'
    }} />
  );

  const BannerSkeleton = () => (
    <div style={{ 
      width: '100%', 
      height: '200px', 
      backgroundColor: '#F0F0F0', 
      borderRadius: '12px', 
      marginBottom: '32px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite'
    }} />
  );

  const CategoriesSkeleton = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', overflowX: 'hidden' }}>
      {[...Array(5)].map((_, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: '#F0F0F0', 
            borderRadius: '16px', 
            marginBottom: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              backgroundColor: '#E0E0E0', 
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #e0e0e0 25%, #d0d0d0 50%, #e0e0e0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite'
            }} />
          </div>
          <div style={{ 
            width: '40px', 
            height: '12px', 
            backgroundColor: '#F0F0F0', 
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite'
          }} />
        </div>
      ))}
    </div>
  );

  const ProductGridSkeleton = () => (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: {
        xs: 'repeat(2, 1fr)',
        sm: 'repeat(3, 1fr)',
        md: 'repeat(4, 1fr)'
      },
      gap: { xs: 1.5, sm: 2 }
    }}>
      {[...Array(8)].map((_, index) => (
        <Box key={index} sx={{ 
          border: '1px solid #F3F4F6',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            width: '100%', 
            height: { xs: 120, sm: 140, md: 160 }, 
            bgcolor: '#F0F0F0',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            '@keyframes loading': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }} />
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ 
              width: '80%', 
              height: 16, 
              bgcolor: '#F0F0F0', 
              borderRadius: '4px', 
              mb: 1,
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite',
              '@keyframes loading': {
                '0%': { backgroundPosition: '200% 0' },
                '100%': { backgroundPosition: '-200% 0' }
              }
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Box sx={{ 
                width: 14, 
                height: 14, 
                bgcolor: '#F0F0F0', 
                borderRadius: '50%',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                '@keyframes loading': {
                  '0%': { backgroundPosition: '200% 0' },
                  '100%': { backgroundPosition: '-200% 0' }
                }
              }} />
              <Box sx={{ 
                width: 30, 
                height: 12, 
                bgcolor: '#F0F0F0', 
                borderRadius: '4px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                '@keyframes loading': {
                  '0%': { backgroundPosition: '200% 0' },
                  '100%': { backgroundPosition: '-200% 0' }
                }
              }} />
            </Box>
            <Box sx={{ 
              width: '60%', 
              height: 20, 
              bgcolor: '#F0F0F0', 
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite',
              '@keyframes loading': {
                '0%': { backgroundPosition: '200% 0' },
                '100%': { backgroundPosition: '-200% 0' }
              }
            }} />
          </Box>
        </Box>
      ))}
    </Box>
  );

  if (loading) {
  return (
      <div style={{ 
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        paddingBottom: '80px',
      }}>
        <div style={{ padding: '24px 24px 16px' }}>
          <HeaderSkeleton />
          <SearchSkeleton />
          <BannerSkeleton />
          <CategoriesSkeleton />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '120px', 
              height: '24px', 
              backgroundColor: '#F0F0F0', 
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite'
            }} />
            <div style={{ 
              width: '80px', 
              height: '16px', 
              backgroundColor: '#F0F0F0', 
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite'
            }} />
          </div>
          
          <ProductGridSkeleton />
        </div>
        <BottomNavbar />
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `
        }} />
      </div>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#FFFFFF',
      minHeight: '100vh',
      pb: 10,
    }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                สวัสดีค่ะ คุณบอล
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 400, color: '#6B7280', lineHeight: 1.2 , letterSpacing: '0.15em'}}>
                เอริ ฟู้ด ยินดีต้อนรับ
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
              sx={{
                bgcolor: '#F9FAFB',
                color: '#374151',
                border: '1px solid #E5E7EB',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: '#F3F4F6',
                  borderColor: '#D1D5DB'
                }
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          <StyledInputBase
            placeholder="ค้นหาอาหาร เมนู หรือประเภทอาหาร..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            startAdornment={
              <SearchIcon sx={{ mr: 2, color: '#9CA3AF', fontSize: 20 }} />
            }
            endAdornment={
              searchQuery && (
                <IconButton 
                  onClick={clearSearch}
                  sx={{ 
                    p: 0.5, 
                    color: '#9CA3AF',
                    '&:hover': { 
                      color: '#6B7280',
                      backgroundColor: 'transparent' 
                    }
                  }}
                >
                  <Typography sx={{ fontSize: 18 }}>✕</Typography>
                </IconButton>
              )
            }
          />
          
          {/* Search Results Count */}
          {isSearching && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280', 
                mt: 1, 
                fontSize: '0.875rem' 
              }}
            >
              พบ {products.length} รายการสำหรับ "{searchQuery}"
            </Typography>
          )}
        </Box>

        {/* Promotional Banner */}
        {!isSearching && (
          <Box sx={{
            borderRadius: '12px',
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            height: { xs: 160, sm: 220, md: 280 , lg: 400},
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }}>
          <img 
            src="/banner10percent.webp" 
            alt="Promotional Banner"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
            onError={(e) => {
              // Fallback ถ้าไม่มีรูป
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling!.setAttribute('style', 'display: flex');
            }}
          />
          {/* Fallback content */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white',
            borderRadius: '12px'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: '600',
              mb: 1,
              fontSize: '1rem'
            }}>
              Special Offers Available
            </Typography>
            <Typography variant="body2" sx={{ 
              fontSize: '0.875rem',
              opacity: 0.9
            }}>
              Discover great deals on your favorite dishes
            </Typography>
          </Box>
        </Box>
        )}

        {/* Categories */}
        {!isSearching && (
        <Box sx={{ mb: 5 }}>
          <Swiper
            modules={[FreeMode]}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            grabCursor={true}
            style={{ paddingLeft: '0px', paddingRight: '0px' }}
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category.slug} style={{ width: 'auto' }}>
                <CategoryButton 
                  onClick={() => router.push(`/categories/${encodeURIComponent(category.slug)}`)}
                >
                  <CategoryIcon sx={{ 
                    backgroundColor: categoryColors[index % categoryColors.length], 
                    border: '1px solid #E5E7EB'
                  }}>
                    {getCategoryIcon(category.name)}
                  </CategoryIcon>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#6B7280',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      maxWidth: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {category.name}
                  </Typography>
                </CategoryButton>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
        )}

        {/* Recommended Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            {isSearching ? 'ผลการค้นหา' : 'อาหารของเรา'}
          </Typography>
          {!isSearching && (
            <Typography 
              variant="body2" 
              sx={{ 
                cursor: 'pointer', 
                fontWeight: 500, 
                color: '#6B7280',
                '&:hover': {
                  color: '#374151'
                }
              }}
              onClick={() => router.push('/categories')}
            >
              ดูทั้งหมด
            </Typography>
          )}
        </Box>

        {/* Product Grid */}
        {products.length === 0 && isSearching ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 2 
          }}>
            <Typography sx={{ fontSize: '4rem', mb: 2 }}>🔍</Typography>
            <Typography variant="h6" sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
              ไม่พบอาหารที่ค้นหา
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>
              ลองค้นหาด้วยคำอื่น เช่น "ผัดไทย" "ต้มยำ" หรือ "ข้าวผัด"
            </Typography>
            <Button 
              onClick={clearSearch}
              sx={{ 
                color: '#FFD700',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                }
              }}
            >
              ดูเมนูทั้งหมด
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: { xs: 1.5, sm: 2 }
          }}>
            {products.map((product) => {
            const quantity = getItemQuantity(product.id);
            
            return (
              <Box key={product.id}>
                <ProductCard onClick={() => router.push(`/products/${encodeURIComponent(product.slug)}`)}>
                  <Box sx={{
                    width: '100%',
                    height: { xs: 120, sm: 140, md: 160 },
                    backgroundColor: '#F8F9FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px 12px 0 0'
                  }}>
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
                            (e.target as HTMLImageElement).nextElementSibling!.setAttribute('style', 'display: flex');
                          }}
                        />
                      ) : null}
                      <Box sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: product.image ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, opacity: 0.7 }}>
                          🍽️
                        </Typography>
                      </Box>
                    <ClientOnly>
                      {quantity > 0 && (
                        <Box sx={{
                          position: 'absolute',
                          top: { xs: 6, sm: 8 },
                          right: { xs: 6, sm: 8 },
                          bgcolor: '#374151',
                          borderRadius: '50%',
                          width: { xs: 20, sm: 24 },
                          height: { xs: 20, sm: 24 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                          <Typography 
                            variant="caption" 
                            color="white" 
                            fontWeight={600}
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                          >
                            {quantity}
                          </Typography>
                        </Box>
                      )}
                    </ClientOnly>
                  </Box>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography 
                      variant="body1" 
                      fontWeight={600} 
                      sx={{ 
                        mb: 0.5, 
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        lineHeight: 1.3
                      }} 
                      noWrap
                    >
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <StarIcon sx={{ color: '#9CA3AF', fontSize: { xs: 12, sm: 14 } }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 500, 
                          color: '#9CA3AF',
                          fontSize: { xs: '0.65rem', sm: '0.75rem' }
                        }}
                      >
                        {product.rating}
                      </Typography>
                    </Box>
                    {/* Price Section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {product.originalPrice ? (
                        <>
                          {/* Original Price - แสดงก่อนและขีดฆ่า */}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              textDecoration: 'line-through',
                              color: '#9CA3AF',
                              fontSize: { xs: '0.75rem', sm: '0.85rem' },
                              fontWeight: 500,
                              lineHeight: 1
                            }}
                          >
                            ฿{product.originalPrice.toFixed(2)}
                          </Typography>
                          
                          {/* Current Price & Discount */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#DC2626', 
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                lineHeight: 1
                              }}
                            >
                              ฿{product.price.toFixed(2)}
                            </Typography>
                            <Box sx={{
                              bgcolor: '#FEE2E2',
                              color: '#DC2626',
                              px: 0.5,
                              py: 0.25,
                              borderRadius: '4px',
                              fontSize: { xs: '0.6rem', sm: '0.7rem' },
                              fontWeight: 600,
                              lineHeight: 1
                            }}>
                              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </Box>
                          </Box>
                        </>
                      ) : (
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#DC2626', 
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            lineHeight: 1
                          }}
                        >
                          ฿{product.price.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </ProductCard>
              </Box>
            );
          })}
          </Box>
        )}
      </Box>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </Box>
  );
} 