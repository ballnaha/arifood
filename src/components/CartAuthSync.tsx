'use client'

import { useCartAuth } from '@/hooks/useCartAuth'

/**
 * Component สำหรับซิงค์ authentication status ระหว่าง UserContext และ CartStore
 * จะทำงานแบบ background และไม่แสดง UI ใดๆ
 */
export default function CartAuthSync() {
  useCartAuth()
  return null
} 