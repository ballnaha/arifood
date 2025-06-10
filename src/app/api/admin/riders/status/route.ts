import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../../generated/prisma'

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest) {
  try {
    const { riderId, status } = await request.json()

    if (!riderId || !status) {
      return NextResponse.json(
        { error: 'กรุณาระบุ riderId และ status' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่า status ที่ส่งมาถูกต้อง
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'สถานะไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // อัพเดตสถานะไรเดอร์
    const updatedRider = await prisma.rider.update({
      where: { id: riderId },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'อัพเดตสถานะไรเดอร์สำเร็จ',
      rider: updatedRider
    })
  } catch (error) {
    console.error('Error updating rider status:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดตสถานะไรเดอร์' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 