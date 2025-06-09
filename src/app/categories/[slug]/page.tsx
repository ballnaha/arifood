import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryClientWrapper from './client-wrapper';
import { prisma } from '@/lib/prisma';
import { decodeSlug } from '@/lib/slug';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const { slug: encodedSlug } = await params;
    const slug = decodeSlug(encodedSlug);
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return {
        title: 'ไม่พบหมวดหมู่ | AriFood',
        description: 'ไม่พบหมวดหมู่ที่คุณต้องการ',
      };
    }

    return {
      title: `${category.name} | AriFood - สั่งอาหารออนไลน์`,
      description: `${category.description} - เลือกสรรอาหารอร่อยในหมวด ${category.name} พร้อมส่งถึงบ้าน มีให้เลือก ${category._count.products} รายการ`,
      keywords: [category.name, 'สั่งอาหาร', 'อาหารออนไลน์', 'delivery', category.description || ''],
      openGraph: {
        title: `${category.name} | AriFood`,
        description: `${category.description} - มีให้เลือก ${category._count.products} รายการ`,
        type: 'website',
        locale: 'th_TH',
        url: `/categories/${category.slug}`,
      },
      twitter: {
        card: 'summary',
        title: `${category.name} | AriFood`,
        description: `${category.description} - มีให้เลือก ${category._count.products} รายการ`,
      },
      alternates: {
        canonical: `/categories/${category.slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'เกิดข้อผิดพลาด | AriFood',
      description: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
    };
  }
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true }
    });

    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug: encodedSlug } = await params;
  const slug = decodeSlug(encodedSlug);
  
  // ตรวจสอบว่า category มีอยู่จริงหรือไม่
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (!category) {
    notFound();
  }

  return <CategoryClientWrapper slug={slug} />;
} 