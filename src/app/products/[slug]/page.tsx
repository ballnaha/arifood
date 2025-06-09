import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClientWrapper from './client-wrapper';
import { prisma } from '@/lib/prisma';
import { decodeSlug } from '@/lib/slug';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug: encodedSlug } = await params;
    const slug = decodeSlug(encodedSlug);
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      }
    });

    if (!product) {
      return {
        title: 'ไม่พบสินค้า | AriFood',
        description: 'ไม่พบสินค้าที่คุณต้องการ',
      };
    }

    return {
      title: `${product.name} | AriFood - สั่งอาหารออนไลน์`,
      description: `${product.description} - ราคา ฿${product.price.toFixed(2)} พร้อมส่งถึงบ้าน`,
      keywords: [
        product.name,
        product.category?.name || '',
        'สั่งอาหาร',
        'อาหารออนไลน์',
        'delivery',
        `ราคา ${product.price} บาท`
      ],
      openGraph: {
        title: `${product.name} | AriFood`,
        description: `${product.description} - ฿${product.price.toFixed(2)}`,
        type: 'website',
        locale: 'th_TH',
        url: `/products/${product.slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'เกิดข้อผิดพลาด | AriFood',
      description: 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า',
    };
  }
}

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true }
    });

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug: encodedSlug } = await params;
  const slug = decodeSlug(encodedSlug);
  
  // ตรวจสอบว่า product มีอยู่จริงหรือไม่
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, isActive: true }
  });

  if (!product) {
    notFound();
  }

  return <ProductClientWrapper slug={slug} />;
} 