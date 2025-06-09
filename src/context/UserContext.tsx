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
  address: ''
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData>(defaultUserData)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // ป้องกัน hydration error
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // โหลดข้อมูลจาก localStorage เมื่อ component mount
  useEffect(() => {
    if (!hasMounted) return

    const savedData = localStorage.getItem('user_profile')
    const loginStatus = localStorage.getItem('user_logged_in')
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        
        // เฉพาะการโหลดครั้งแรกเท่านั้น ไม่ clear ข้อมูลที่เพิ่งอัพเดต
        if (loginStatus === 'true' && !parsedData.hasOwnProperty('lineUserId') && parsedData.name === '') {
          console.log('🔧 ตรวจพบข้อมูลเก่าที่ว่างเปล่าจากก่อนการอัพเดต - กำลัง clear localStorage')
          localStorage.removeItem('user_profile')
          localStorage.removeItem('user_logged_in')
          setIsLoggedIn(false)
          setUserData(defaultUserData)
          setIsDataLoaded(true)
          return
        }
        
        setUserData(parsedData)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
      }
    }
    
    if (loginStatus === 'true' && isLoggedIn !== false) {
      setIsLoggedIn(true)
    }
    
    setIsDataLoaded(true)
  }, [hasMounted])

  // ตรวจสอบ login status จากข้อมูล userData (สำหรับกรณีที่มีข้อมูลแต่ isLoggedIn ยัง false)
  useEffect(() => {
    if (isDataLoaded && !isLoggedIn && (userData.id || userData.lineUserId)) {
      console.log('🔧 พบข้อมูล user แต่ isLoggedIn = false, กำลังแก้ไข...')
      setIsLoggedIn(true)
      // อัพเดต localStorage ด้วย
      if (hasMounted && typeof window !== 'undefined') {
        localStorage.setItem('user_logged_in', 'true')
      }
    }
  }, [userData, isLoggedIn, isDataLoaded, hasMounted])

  // บันทึกข้อมูลลง localStorage เมื่อข้อมูลเปลี่ยนแปลง
  useEffect(() => {
    if (isDataLoaded && hasMounted) {
      localStorage.setItem('user_profile', JSON.stringify(userData))
    }
  }, [userData, isDataLoaded, hasMounted])

  // บันทึกสถานะ login
  useEffect(() => {
    if (isDataLoaded && hasMounted) {
      localStorage.setItem('user_logged_in', isLoggedIn.toString())
    }
  }, [isLoggedIn, isDataLoaded, hasMounted])

  const updateUserData = useCallback((data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }))
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setUserData(defaultUserData)
    if (hasMounted && typeof window !== 'undefined') {
      localStorage.removeItem('user_logged_in')
      localStorage.removeItem('user_profile')
    }
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