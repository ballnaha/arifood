import { NextRequest, NextResponse } from 'next/server'
import { broadcastToAll, notifyRestaurant, notifyCustomer, notifyRider } from '@/lib/socket'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, type = 'broadcast-message' } = body

    if (!message) {
      return NextResponse.json(
        { error: 'message จำเป็นต้องระบุ' },
        { status: 400 }
      )
    }

    const notificationData = {
      message,
      type,
      timestamp: new Date().toISOString(),
      from: 'api-broadcast'
    }

    // ส่งข้อความไปทุกกลุ่ม
    const results = {
      broadcast: false,
      restaurants: false,
      customers: false,
      riders: false
    }

    // ส่งแบบ broadcast ทั่วไป
    results.broadcast = broadcastToAll('broadcast-message', notificationData)

    // ส่งไปกลุ่มเฉพาะด้วยเพื่อให้แน่ใจ
    // (อาจจะมีคนที่เข้าร่วมห้องเฉพาะแต่ไม่ได้ฟัง broadcast)
    
    // ส่งไปร้านอาหารตัวอย่าง
    notifyRestaurant('test-restaurant', notificationData)
    notifyRestaurant('1', notificationData)
    notifyRestaurant('2', notificationData)
    
    // ส่งไปลูกค้าตัวอย่าง
    notifyCustomer('test-customer', notificationData)
    notifyCustomer('1', notificationData)
    notifyCustomer('2', notificationData)
    
    // ส่งไปไรเดอร์ตัวอย่าง
    notifyRider('test-rider', notificationData)
    notifyRider('1', notificationData)
    notifyRider('2', notificationData)

    if (results.broadcast) {
      return NextResponse.json({
        success: true,
        message: 'ส่งข้อความ broadcast ไปทุกกลุ่มสำเร็จ',
        data: notificationData,
        results
      })
    } else {
      return NextResponse.json(
        { error: 'ไม่สามารถส่งข้อความได้ - Socket.IO server ยังไม่พร้อม' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการส่งข้อความ broadcast:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
} 