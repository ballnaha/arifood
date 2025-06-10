import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'arifood-jwt-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'ไม่พบ token การยืนยันตัวตน' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // ตรวจสอบ JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { error: 'Token ไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        restaurant: true,
        riderProfile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      )
    }

    // ส่งข้อมูลผู้ใช้กลับ (ไม่รวมรหัสผ่าน)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      lineUserId: user.lineUserId,
      avatar: user.avatar,
      role: user.role,
      restaurant: user.restaurant ? {
        id: user.restaurant.id,
        name: user.restaurant.name,
        description: user.restaurant.description,
        address: user.restaurant.address,
        phone: user.restaurant.phone,
        rating: user.restaurant.rating,
        deliveryTime: user.restaurant.deliveryTime
      } : null,
      riderProfile: user.riderProfile ? {
        id: user.riderProfile.id,
        vehicleType: user.riderProfile.vehicleType,
        vehiclePlate: user.riderProfile.vehiclePlate,
        status: user.riderProfile.status,
        isOnline: user.riderProfile.isOnline,
        rating: user.riderProfile.rating,
        totalDeliveries: user.riderProfile.totalDeliveries
      } : null
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบตัวตน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 