import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest) {
  try {
    const { restaurantId, status } = await request.json()

    if (!restaurantId || !status) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'สถานะไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { status },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'อัปเดตสถานะสำเร็จ',
      restaurant: updatedRestaurant
    })
  } catch (error) {
    console.error('Error updating restaurant status:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' },
      { status: 500 }
    )
  }
} 