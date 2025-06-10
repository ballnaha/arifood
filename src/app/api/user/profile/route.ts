import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'arifood-jwt-secret-key-2024'

// ฟังก์ชันสำหรับดึง user ID จาก JWT token
function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.userId || null
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลการยืนยันตัวตน' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        restaurant: true
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
      } : null
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลการยืนยันตัวตน' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, email, phone, address, latitude, longitude } = data

    // อัพเดทข้อมูลผู้ใช้ในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: userId },
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