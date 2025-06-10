import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        restaurant: {
          select: {
            name: true,
            status: true
          }
        },
        riderProfile: {
          select: {
            vehicleType: true,
            vehiclePlate: true,
            status: true,
            rating: true,
            totalDeliveries: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // แปลงข้อมูลให้เป็นรูปแบบที่ frontend ต้องการ
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      restaurant: user.restaurant ? {
        name: user.restaurant.name,
        status: user.restaurant.status
      } : null,
      riderProfile: user.riderProfile ? {
        vehicleType: user.riderProfile.vehicleType,
        vehiclePlate: user.riderProfile.vehiclePlate,
        status: user.riderProfile.status,
        rating: user.riderProfile.rating,
        totalDeliveries: user.riderProfile.totalDeliveries
      } : null
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 