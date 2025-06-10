import { useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useCartStore } from '@/store/cartStore'

/**
 * Hook สำหรับซิงค์ authentication status ระหว่าง UserContext และ CartStore
 * จะ clear cart อัตโนมัติเมื่อผู้ใช้ logout
 */
export function useCartAuth() {
  const { userData } = useUser()
  const { setAuthenticated, checkAuthAndClearIfNeeded } = useCartStore()
  
  const isLoggedIn = !!userData

  useEffect(() => {
    // อัพเดท auth status ใน cart store
    setAuthenticated(isLoggedIn)
  }, [isLoggedIn, setAuthenticated])

  useEffect(() => {
    // ตรวจสอบ auth status เมื่อ component mount
    checkAuthAndClearIfNeeded()
  }, [checkAuthAndClearIfNeeded])
} 