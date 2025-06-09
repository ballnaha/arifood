import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

// Get user profile
export async function GET(request: NextRequest) {
  try {
    // ใน production จริงๆ ต้องใช้ JWT หรือ session
    // ตอนนี้ใช้ demo data
    const demoUser = {
      id: 'demo-user-id',
      name: 'สมชาย ใจดี',
      phone: '081-234-5678',
      address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
      latitude: null,
      longitude: null,
      email: 'demo@example.com'
    }

    return NextResponse.json(demoUser)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' },
      { status: 500 }
    )
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, name, email, phone, address, latitude, longitude } = data

    if (!id) {
      return NextResponse.json(
        { error: 'ไม่พบ ID ผู้ใช้' },
        { status: 400 }
      )
    }

    // อัพเดทข้อมูลผู้ใช้ในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        latitude: latitude !== undefined ? latitude : undefined,
        longitude: longitude !== undefined ? longitude : undefined,
      },
      include: {
        restaurant: true
      }
    })

    // ส่งข้อมูลที่อัพเดทแล้วกลับ (ไม่รวมรหัสผ่าน)
    const userData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      latitude: updatedUser.latitude,
      longitude: updatedUser.longitude,
      lineUserId: updatedUser.lineUserId,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      restaurant: updatedUser.restaurant ? {
        id: updatedUser.restaurant.id,
        name: updatedUser.restaurant.name,
        description: updatedUser.restaurant.description,
        address: updatedUser.restaurant.address,
        phone: updatedUser.restaurant.phone,
        rating: updatedUser.restaurant.rating,
        deliveryTime: updatedUser.restaurant.deliveryTime
      } : null
    }

    return NextResponse.json({
      message: 'อัพเดทข้อมูลสำเร็จ',
      user: userData
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 