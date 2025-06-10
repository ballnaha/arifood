import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

interface UseRequireAuthOptions {
  redirectTo?: string
  onUnauthorized?: () => void
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { userData } = useUser()
  const router = useRouter()
  
  const isLoggedIn = !!userData
  
  const { 
    redirectTo = '/login', 
    onUnauthorized 
  } = options

  const requireAuth = (callback?: () => void): boolean => {
    if (isLoggedIn) {
      // ถ้า login แล้ว ให้ทำงานตามปกติ
      if (callback) callback()
      return true
    } else {
      // ถ้ายัง login ให้ redirect หรือ callback
      if (onUnauthorized) {
        onUnauthorized()
      } else {
        router.push(redirectTo)
      }
      return false
    }
  }

  const requireAuthAsync = async (callback?: () => Promise<void>): Promise<boolean> => {
    if (isLoggedIn) {
      if (callback) await callback()
      return true
    } else {
      if (onUnauthorized) {
        onUnauthorized()
      } else {
        router.push(redirectTo)
      }
      return false
    }
  }

  return {
    isLoggedIn,
    requireAuth,
    requireAuthAsync
  }
} 