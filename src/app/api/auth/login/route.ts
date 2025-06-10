import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'arifood-jwt-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      )
    }

    // หาผู้ใช้ในฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurant: true,
        riderProfile: true
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

    // สร้าง JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

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

    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: userData,
      token: token
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