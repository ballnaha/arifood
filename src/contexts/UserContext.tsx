'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Restaurant {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  rating: number
  deliveryTime?: string
}

interface RiderProfile {
  id: string
  vehicleType: string
  vehiclePlate?: string
  status: string
  isOnline: boolean
  rating: number
  totalDeliveries: number
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  latitude?: number
  longitude?: number
  lineUserId?: string
  avatar?: string
  role: 'ADMIN' | 'CUSTOMER' | 'RESTAURANT_OWNER' | 'RIDER'
  restaurant?: Restaurant
  riderProfile?: RiderProfile
}

interface UserContextType {
  userData: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUserData: (data: Partial<User>) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // ตรวจสอบ session เมื่อ component mount
  useEffect(() => {
    setIsMounted(true)
    checkSession()
  }, [])

  const checkSession = async () => {
    if (typeof window === 'undefined') return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUserData(userData)
      } else {
        // Token หมดอายุหรือไม่ถูกต้อง
        localStorage.removeItem('token')
        setUserData(null)
      }
    } catch (error) {
      console.error('Check session error:', error)
      localStorage.removeItem('token')
      setUserData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.token && data.user) {
        // เก็บ token ใน localStorage (client-side เท่านั้น)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token)
        }
        setUserData(data.user)
        return true
      } else {
        console.error('Login failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    setUserData(null)
  }

  const updateUserData = (data: Partial<User>) => {
    if (userData) {
      setUserData({ ...userData, ...data })
    }
  }

  // ป้องกัน hydration mismatch
  if (!isMounted) {
    return (
      <UserContext.Provider value={{
        userData: null,
        login,
        logout,
        updateUserData,
        isLoading: true
      }}>
        {children}
      </UserContext.Provider>
    )
  }

  return (
    <UserContext.Provider value={{
      userData,
      login,
      logout,
      updateUserData,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 