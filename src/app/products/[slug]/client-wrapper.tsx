'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

interface ProductClientWrapperProps {
  slug: string;
}

const ProductClient = dynamic(() => import('./client'), {
  ssr: false,
  loading: () => <Loading text="กำลังโหลด" fullScreen />
});

export default function ProductClientWrapper({ slug }: ProductClientWrapperProps) {
  return <ProductClient slug={slug} />;
} 