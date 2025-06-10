import { NextRequest, NextResponse } from 'next/server'
import { notifyRestaurant, notifyCustomer, notifyRider } from '@/lib/socket'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetType, targetId, message, type = 'group-message' } = body

    if (!targetType || !targetId || !message) {
      return NextResponse.json(
        { error: 'targetType, targetId, และ message จำเป็นต้องระบุ' },
        { status: 400 }
      )
    }

    const notificationData = {
      message,
      type,
      timestamp: new Date().toISOString(),
      from: 'api-notification'
    }

    let success = false

    switch (targetType) {
      case 'restaurant':
        success = notifyRestaurant(targetId, notificationData)
        break
      case 'customer':
        success = notifyCustomer(targetId, notificationData)
        break
      case 'rider':
        success = notifyRider(targetId, notificationData)
        break
      default:
        return NextResponse.json(
          { error: 'targetType ต้องเป็น restaurant, customer, หรือ rider' },
          { status: 400 }
        )
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `ส่งข้อความไป ${targetType}-${targetId} สำเร็จ`,
        data: notificationData
      })
    } else {
      return NextResponse.json(
        { error: 'ไม่สามารถส่งข้อความได้ - อาจเป็นเพราะ Socket.IO server ยังไม่พร้อม' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการส่งข้อความ:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
} 