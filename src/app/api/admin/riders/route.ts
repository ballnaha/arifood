import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const riders = await prisma.rider.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // แปลงข้อมูลให้เป็นรูปแบบที่ frontend ต้องการ
    const formattedRiders = riders.map(rider => ({
      id: rider.id,
      licenseNumber: rider.licenseNumber,
      vehicleType: rider.vehicleType,
      vehiclePlate: rider.vehiclePlate,
      bankAccount: rider.bankAccount,
      bankName: rider.bankName,
      status: rider.status,
      isOnline: rider.isOnline,
      rating: rider.rating,
      totalDeliveries: rider.totalDeliveries,
      createdAt: rider.createdAt.toISOString(),
      user: {
        id: rider.user.id,
        name: rider.user.name,
        email: rider.user.email,
        phone: rider.user.phone,
        address: rider.user.address,
        isActive: rider.user.isActive
      }
    }))

    return NextResponse.json(formattedRiders)
  } catch (error) {
    console.error('Error fetching riders:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลไรเดอร์' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 