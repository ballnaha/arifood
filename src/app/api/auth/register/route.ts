import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, role, address, latitude, longitude, restaurant } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // ตรวจสอบรูปแบบอีเมล
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      )
    }

    // ตรวจสอบ role ที่ถูกต้อง
    if (!['CUSTOMER', 'RESTAURANT_OWNER'].includes(role)) {
      return NextResponse.json(
        { error: 'ประเภทผู้ใช้ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // ตรวจสอบเบอร์โทรศัพท์ (ถ้ามี)
    if (phone && !/^0\d{8,9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'รูปแบบเบอร์โทรไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // ตรวจสอบข้อมูลร้าน (สำหรับเจ้าของร้าน)
    if (role === 'RESTAURANT_OWNER') {
      if (!restaurant || !restaurant.name || !restaurant.address) {
        return NextResponse.json(
          { error: 'กรุณากรอกข้อมูลร้านอาหารให้ครบถ้วน' },
          { status: 400 }
        )
      }
    }

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 12)

    // สร้างผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        address: address || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        password: hashedPassword,
        role: role,
      }
    })

    // สร้างร้านอาหาร (ถ้าเป็นเจ้าของร้าน)
    if (role === 'RESTAURANT_OWNER' && restaurant) {
      const slug = restaurant.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')

      await prisma.restaurant.create({
        data: {
          name: restaurant.name,
          slug,
          description: restaurant.description || null,
          address: restaurant.address,
          phone,
          email,
          deliveryTime: restaurant.deliveryTime || '30-45 นาที',
          ownerId: newUser.id
        }
      })
    }

    // ส่งข้อมูลผู้ใช้กลับ (ไม่รวมรหัสผ่าน)
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      latitude: newUser.latitude,
      longitude: newUser.longitude,
      role: newUser.role
    }

    return NextResponse.json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: userResponse
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    // ตรวจสอบ Prisma error codes
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    )
  }
} 