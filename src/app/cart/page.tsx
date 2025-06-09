import type { Metadata } from 'next';
import CartClient from './client';
import ClientOnly from '@/components/ClientOnly';
import { Box, Container, Typography, Card, CardContent, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'ตะกร้าสินค้า | AriFood - Food Delivery',
  description: 'ตรวจสอบและจัดการสินค้าในตะกร้าของคุณ พร้อมสั่งอาหารออนไลน์ได้ทันที',
  keywords: ['ตะกร้าสินค้า', 'สั่งอาหาร', 'อาหารออนไลน์', 'delivery'],
  openGraph: {
    title: 'ตะกร้าสินค้า | AriFood',
    description: 'ตรวจสอบและจัดการสินค้าในตะกร้าของคุณ',
    type: 'website',
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary',
    title: 'ตะกร้าสินค้า | AriFood',
    description: 'ตรวจสอบและจัดการสินค้าในตะกร้าของคุณ',
  },
  robots: 'noindex, nofollow', // ไม่ต้องให้ search engine index หน้าตะกร้า
};

// Cart Skeleton Loading Component
function CartSkeleton() {
  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', paddingBottom: '96px' }}>
      {/* Header Skeleton */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #E5E7EB',
        padding: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}></div>
          <div style={{
            width: '150px',
            height: '24px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}></div>
        </div>
      </div>

      {/* Loading Content */}
      <div style={{ 
        textAlign: 'center', 
        padding: '64px 16px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <ShoppingCartIcon style={{ fontSize: '80px', color: '#9CA3AF', marginBottom: '16px' }} />
        <div style={{
          width: '200px',
          height: '24px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          margin: '0 auto 12px'
        }}></div>
        <div style={{
          width: '280px',
          height: '16px',
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          margin: '0 auto 24px'
        }}></div>
        <div style={{
          width: '120px',
          height: '40px',
          borderRadius: '8px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          margin: '0 auto'
        }}></div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export default function CartPage() {
  return (
    <ClientOnly fallback={<CartSkeleton />}>
      <CartClient />
    </ClientOnly>
  );
} 