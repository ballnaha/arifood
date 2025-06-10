import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
}

export const useSocket = (url: string = '', options: UseSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const initAttemptRef = useRef(false)

  const { autoConnect = true, reconnection = true } = options

  useEffect(() => {
    if (!autoConnect || initAttemptRef.current) return
    
    initAttemptRef.current = true
    console.log('🚀 เริ่มต้นการเชื่อมต่อ Socket.IO...')

    // รอให้หน้าโหลดเสร็จก่อน
    const timer = setTimeout(() => {
      connectSocket()
    }, 2000)

    function connectSocket() {
      try {
        // สร้าง Socket.IO connection
        const socketUrl = url || (typeof window !== 'undefined' ? window.location.origin : '')
        
        console.log('🔗 กำลังเชื่อมต่อ Socket.IO ที่:', socketUrl)
        
        socketRef.current = io(socketUrl, {
          path: '/api/socket',
          transports: ['polling'], // ใช้ polling เท่านั้นก่อน
          upgrade: false, // ปิด upgrade เพื่อความเสถียร
          reconnection,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          timeout: 20000, // 20 วินาที
          forceNew: true,
          autoConnect: true
        })

        const socket = socketRef.current

        // Event listeners
        socket.on('connect', () => {
          console.log('✅ เชื่อมต่อ Socket.IO สำเร็จ')
          setIsConnected(true)
          setError(null)
          
          // เรียก Socket.IO server endpoint เพื่อให้แน่ใจว่า server พร้อม
          fetch('/api/socket')
            .then(() => console.log('🔧 Socket.IO server initialized'))
            .catch(err => console.log('⚠️ Socket.IO server may not be ready:', err))
        })

        socket.on('disconnect', (reason) => {
          console.log('❌ ตัดการเชื่อมต่อ Socket.IO:', reason)
          setIsConnected(false)
        })

        socket.on('connect_error', (err) => {
          console.error('❌ เชื่อมต่อ Socket.IO ไม่สำเร็จ:', err.message)
          setError(err.message)
          setIsConnected(false)
          
          // หาก timeout ให้ลองใหม่อีกครั้ง
          if (err.message.includes('timeout')) {
            console.log('🔄 กำลังลองเชื่อมต่อใหม่หลัง timeout...')
            setTimeout(() => {
              fetch('/api/socket')
                .then(() => {
                  console.log('📡 ลองเชื่อมต่อ Socket.IO ใหม่...')
                  socket.connect()
                })
                .catch(() => {
                  console.log('⚠️ ไม่สามารถเรียก Socket.IO server endpoint')
                })
            }, 3000)
          }
        })

        socket.on('reconnect', (attemptNumber) => {
          console.log('🔄 เชื่อมต่อ Socket.IO ใหม่สำเร็จ:', attemptNumber)
          setIsConnected(true)
          setError(null)
        })

        socket.on('reconnect_error', (err) => {
          console.error('❌ เชื่อมต่อใหม่ไม่สำเร็จ:', err.message)
          setError(err.message)
        })

        socket.on('reconnect_failed', () => {
          console.error('❌ เชื่อมต่อใหม่ล้มเหลว')
          setError('การเชื่อมต่อใหม่ล้มเหลว - กรุณาลองรีเฟรชหน้า')
        })
        
      } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการตั้งค่า Socket.IO:', error)
        setError('เกิดข้อผิดพลาดในการตั้งค่า')
      }
    }

    // Cleanup function
    return () => {
      clearTimeout(timer)
      if (socketRef.current) {
        console.log('🔌 ปิดการเชื่อมต่อ Socket.IO')
        socketRef.current.disconnect()
      }
      initAttemptRef.current = false
    }
  }, [url, autoConnect, reconnection])

  const connect = () => {
    console.log('🔄 พยายามเชื่อมต่อใหม่...')
    setError(null)
    
    // เรียก Socket.IO server endpoint ก่อน
    fetch('/api/socket')
      .then(() => {
        console.log('📡 เริ่มต้น Socket.IO server สำเร็จ')
        // รอสักครู่แล้วลองเชื่อมต่อ
        setTimeout(() => {
          if (socketRef.current) {
            socketRef.current.connect()
          }
        }, 1000)
      })
      .catch(err => {
        console.error('❌ ไม่สามารถเริ่มต้น Socket.IO server:', err)
        setError('ไม่สามารถเริ่มต้น Socket.IO server')
      })
  }

  const disconnect = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect()
    }
  }

  const joinRoom = (roomType: 'restaurant' | 'customer' | 'rider', id: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(`join-${roomType}`, id)
      console.log(`🏠 เข้าร่วมห้อง ${roomType}: ${id}`)
    } else {
      console.warn('⚠️ ไม่สามารถเข้าร่วมห้องได้ Socket ยังไม่เชื่อมต่อ')
    }
  }

  const emit = (eventName: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(eventName, data)
      console.log(`📤 ส่งข้อมูล ${eventName}:`, data)
    } else {
      console.warn('⚠️ ไม่สามารถส่งข้อมูลได้ Socket ยังไม่เชื่อมต่อ')
    }
  }

  const on = (eventName: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback)
      console.log(`👂 ฟังเหตุการณ์: ${eventName}`)
    }
  }

  const off = (eventName: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(eventName, callback)
      console.log(`🔇 หยุดฟังเหตุการณ์: ${eventName}`)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    joinRoom,
    emit,
    on,
    off
  }
}

export default useSocket 