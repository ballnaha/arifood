import { Server as IOServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'

interface ExtendedServer extends HttpServer {
  io?: IOServer
}

let globalIo: IOServer | null = null

export const initSocket = (server: ExtendedServer) => {
  if (!server.io) {
    console.log('Starting Socket.IO server...')
    
    const ioInstance = new IOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    // จัดการการเชื่อมต่อ
    ioInstance.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join room สำหรับร้านอาหาร
      socket.on('join-restaurant', (restaurantId: string) => {
        socket.join(`restaurant-${restaurantId}`)
        console.log(`Socket ${socket.id} joined restaurant room: ${restaurantId}`)
      })

      // Join room สำหรับลูกค้า
      socket.on('join-customer', (customerId: string) => {
        socket.join(`customer-${customerId}`)
        console.log(`Socket ${socket.id} joined customer room: ${customerId}`)
      })

      // Join room สำหรับไรเดอร์
      socket.on('join-rider', (riderId: string) => {
        socket.join(`rider-${riderId}`)
        console.log(`Socket ${socket.id} joined rider room: ${riderId}`)
      })

      // จัดการการยกเลิกการเชื่อมต่อ
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    server.io = ioInstance
    globalIo = ioInstance
  }
  
  return server.io
}

export const getSocket = () => {
  return globalIo
}

export const setSocket = (ioInstance: IOServer) => {
  globalIo = ioInstance
}

// ฟังก์ชันสำหรับเก็บ io instance
export const setGlobalIo = (io: IOServer) => {
  globalIo = io
}

// ฟังก์ชันสำหรับดึง io instance
export const getGlobalIo = (): IOServer | null => {
  return globalIo
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือนไปยังร้านอาหาร
export const notifyRestaurant = (restaurantId: string, data: any) => {
  if (globalIo) {
    // ส่งเป็น new-order event (ตามปกติ) หรือ custom event ตาม data.type
    const eventName = data.type || 'new-order'
    globalIo.to(`restaurant-${restaurantId}`).emit(eventName, data)
    console.log(`📢 ส่งการแจ้งเตือนไปยังร้าน ${restaurantId} (${eventName}):`, data)
    return true
  }
  console.log('❌ Socket.IO ยังไม่ได้เริ่มต้น')
  return false
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือนไปยังลูกค้า
export const notifyCustomer = (customerId: string, data: any) => {
  if (globalIo) {
    // ส่งเป็น order-update event (ตามปกติ) หรือ custom event ตาม data.type
    const eventName = data.type || 'order-update'
    globalIo.to(`customer-${customerId}`).emit(eventName, data)
    console.log(`📢 ส่งการแจ้งเตือนไปยังลูกค้า ${customerId} (${eventName}):`, data)
    return true
  }
  console.log('❌ Socket.IO ยังไม่ได้เริ่มต้น')
  return false
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือนไปยังไรเดอร์
export const notifyRider = (riderId: string, data: any) => {
  if (globalIo) {
    // ส่งเป็น delivery-update event (ตามปกติ) หรือ custom event ตาม data.type
    const eventName = data.type || 'delivery-update'
    globalIo.to(`rider-${riderId}`).emit(eventName, data)
    console.log(`📢 ส่งการแจ้งเตือนไปยังไรเดอร์ ${riderId} (${eventName}):`, data)
    return true
  }
  console.log('❌ Socket.IO ยังไม่ได้เริ่มต้น')
  return false
}

// ฟังก์ชันสำหรับส่งการแจ้งเตือนทั่วไป
export const broadcastToAll = (eventName: string, data: any) => {
  if (globalIo) {
    globalIo.emit(eventName, data)
    console.log(`📢 ส่งการแจ้งเตือนทั่วไป ${eventName}:`, data)
    return true
  }
  console.log('❌ Socket.IO ยังไม่ได้เริ่มต้น')
  return false
} 