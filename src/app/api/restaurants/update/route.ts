import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      restaurantId, 
      name, 
      description, 
      address, 
      phone, 
      email, 
      deliveryTime,
      latitude,
      longitude 
    } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ ID ร้านอาหาร' },
        { status: 400 }
      )
    }

    if (!name || !address) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อร้านและที่อยู่' },
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

    // ตรวจสอบอีเมล (ถ้ามี)
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // อัปเดตข้อมูลร้านอาหาร
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name,
        description: description || null,
        address,
        phone: phone || null,
        email: email || null,
        deliveryTime: deliveryTime || '30-45 นาที',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      }
    })

    return NextResponse.json({
      message: 'อัปเดตข้อมูลร้านอาหารสำเร็จ',
      restaurant: updatedRestaurant
    })

  } catch (error: any) {
    console.error('Restaurant update error:', error)
    
    // ตรวจสอบ Prisma error codes
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'ไม่พบร้านอาหารที่ระบุ' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลร้าน' },
      { status: 500 }
    )
  }
} 