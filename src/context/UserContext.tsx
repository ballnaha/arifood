'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface UserData {
  id?: string
  name: string
  email?: string
  phone: string
  address: string
  latitude?: number
  longitude?: number
  lineUserId?: string
  avatar?: string
  role?: string
  restaurant?: {
    id: string
    name: string
    description?: string
    address: string
    phone?: string
    rating?: number
    deliveryTime?: string
  } | null
}

interface UserContextType {
  userData: UserData
  updateUserData: (data: Partial<UserData>) => void
  isDataLoaded: boolean
  isLoggedIn: boolean
  setIsLoggedIn: (status: boolean) => void
  logout: () => void
}

const defaultUserData: UserData = {
  name: '',
  phone: '',
  address: '',
  email: '',
  avatar: ''
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(defaultUserData)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // ป้องกัน hydration error - ต้องทำให้ state เริ่มต้นเหมือนกันระหว่าง server และ client
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // โหลดข้อมูลจาก localStorage หลังจาก mount เท่านั้น
  useEffect(() => {
    if (!hasMounted) return

    try {
      const savedData = localStorage.getItem('user_profile')
      const loginStatus = localStorage.getItem('user_logged_in')
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setUserData(parsedData)
      }
      
      if (loginStatus === 'true') {
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem('user_profile')
      localStorage.removeItem('user_logged_in')
    }
    
    setIsDataLoaded(true)
  }, [hasMounted])

  // ตรวจสอบ login status จากข้อมูล userData
  useEffect(() => {
    if (hasMounted && isDataLoaded && !isLoggedIn && (userData.id || userData.lineUserId)) {
      console.log('🔧 พบข้อมูล user แต่ isLoggedIn = false, กำลังแก้ไข...')
      setIsLoggedIn(true)
      localStorage.setItem('user_logged_in', 'true')
    }
  }, [userData, isLoggedIn, isDataLoaded, hasMounted])

  // บันทึกข้อมูลลง localStorage เมื่อข้อมูลเปลี่ยนแปลง
  useEffect(() => {
    if (hasMounted && isDataLoaded) {
      localStorage.setItem('user_profile', JSON.stringify(userData))
    }
  }, [userData, isDataLoaded, hasMounted])

  // บันทึกสถานะ login
  useEffect(() => {
    if (hasMounted && isDataLoaded) {
      localStorage.setItem('user_logged_in', isLoggedIn.toString())
    }
  }, [isLoggedIn, isDataLoaded, hasMounted])

  const updateUserData = useCallback((data: Partial<UserData>) => {
    console.log('🔄 อัพเดทข้อมูลผู้ใช้:', data)
    setUserData(prev => {
      const newData = { ...prev, ...data }
      console.log('👤 ข้อมูลผู้ใช้ใหม่:', newData)
      return newData
    })
  }, [])

  const logout = useCallback(() => {
    console.log('🚪 ผู้ใช้ logout - กำลังเคลียร์ข้อมูล...')
    setIsLoggedIn(false)
    setUserData(defaultUserData)
    if (hasMounted) {
      localStorage.removeItem('user_logged_in')
      localStorage.removeItem('user_profile')
    }
    // Cart จะถูก clear อัตโนมัติโดย CartAuthSync component
  }, [hasMounted])

  return (
    <UserContext.Provider value={{ 
      userData, 
      updateUserData, 
      isDataLoaded, 
      isLoggedIn, 
      setIsLoggedIn, 
      logout 
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