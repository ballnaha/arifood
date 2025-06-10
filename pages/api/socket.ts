import { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import { setGlobalIo } from '@/lib/socket'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const resWithSocket = res as any

  if (resWithSocket.socket?.server?.io) {
    console.log('✅ Socket.IO already running')
    res.status(200).json({ status: 'Socket.IO server already running' })
    return
  }

  console.log('🚀 Starting Socket.IO server...')
  
  const io = new IOServer(resWithSocket.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    allowRequest: (req, fn) => {
      // Accept all requests
      fn(null, true)
    },
    pingTimeout: 60000, // เพิ่ม ping timeout
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6,
    connectTimeout: 45000, // เพิ่ม connect timeout
    serveClient: false, // ปิดการ serve client เพื่อลดโหลด
    destroyUpgrade: true,
    destroyUpgradeTimeout: 1000
  })

  // จัดการการเชื่อมต่อ
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id, 'Transport:', socket.conn.transport.name)

    // ส่งสัญญาณยืนยันการเชื่อมต่อ
    socket.emit('connected', { 
      id: socket.id, 
      timestamp: new Date().toISOString(),
      transport: socket.conn.transport.name
    })

    // ฟังการเปลี่ยน transport
    socket.conn.on('upgrade', () => {
      console.log('🔄 Upgraded to transport:', socket.conn.transport.name)
    })

    // จัดการ ping/pong
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // Join room สำหรับร้านอาหาร
    socket.on('join-restaurant', (restaurantId: string) => {
      socket.join(`restaurant-${restaurantId}`)
      console.log(`🏠 Socket ${socket.id} joined restaurant room: ${restaurantId}`)
      socket.emit('joined-room', { 
        room: `restaurant-${restaurantId}`, 
        type: 'restaurant',
        timestamp: new Date().toISOString()
      })
    })

    // Join room สำหรับลูกค้า
    socket.on('join-customer', (customerId: string) => {
      socket.join(`customer-${customerId}`)
      console.log(`🏠 Socket ${socket.id} joined customer room: ${customerId}`)
      socket.emit('joined-room', { 
        room: `customer-${customerId}`, 
        type: 'customer',
        timestamp: new Date().toISOString()
      })
    })

    // Join room สำหรับไรเดอร์
    socket.on('join-rider', (riderId: string) => {
      socket.join(`rider-${riderId}`)
      console.log(`🏠 Socket ${socket.id} joined rider room: ${riderId}`)
      socket.emit('joined-room', { 
        room: `rider-${riderId}`, 
        type: 'rider',
        timestamp: new Date().toISOString()
      })
    })

    // ทดสอบการส่งข้อความ
    socket.on('test-message', (data) => {
      console.log('📨 Received test message:', data)
      socket.emit('test-message', { 
        ...data, 
        echo: true, 
        timestamp: new Date().toISOString(),
        receivedAt: new Date().toISOString()
      })
    })

    // จัดการการยกเลิกการเชื่อมต่อ
    socket.on('disconnect', (reason) => {
      console.log('❌ Client disconnected:', socket.id, 'Reason:', reason)
    })

    // จัดการ error
    socket.on('error', (error) => {
      console.error('🔥 Socket error:', error)
    })

    // จัดการ connect_error
    socket.on('connect_error', (error) => {
      console.error('🔥 Socket connect error:', error)
    })
  })

  // จัดการ error ของ io server
  io.on('error', (error) => {
    console.error('🔥 IO Server error:', error)
  })

  // เก็บ io instance ใน global
  resWithSocket.socket.server.io = io
  setGlobalIo(io)
  
  console.log('✅ Socket.IO server started successfully')
  res.status(200).json({ 
    status: 'Socket.IO server initialized', 
    timestamp: new Date().toISOString(),
    path: '/api/socket'
  })
} 