'use client';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

interface CategoryClientWrapperProps {
  slug: string;
}

const CategoryClient = dynamic(() => import('./client'), {
  loading: () => <Loading text="กำลังโหลด" fullScreen />
});

export default function CategoryClientWrapper({ slug }: CategoryClientWrapperProps) {
  return <CategoryClient slug={slug} />;
} 