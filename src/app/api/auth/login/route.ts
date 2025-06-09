import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      )
    }

    // ค้นหาผู้ใช้ในฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurant: true // รวมข้อมูลร้านอาหารถ้ามี
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบบัญชีผู้ใช้นี้' },
        { status: 401 }
      )
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
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

    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userData
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 