import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // แปลงข้อมูลให้เป็นรูปแบบที่ frontend ต้องการ
    const formattedRestaurants = restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.address,
      status: restaurant.status,
      rating: restaurant.rating,
      deliveryTime: restaurant.deliveryTime,
      deliveryFee: restaurant.deliveryFee,
      minimumOrder: restaurant.minimumOrder,
      isActive: restaurant.isActive,
      isOpen: restaurant.isOpen,
      createdAt: restaurant.createdAt.toISOString(),
      owner: {
        name: restaurant.owner.name,
        email: restaurant.owner.email,
        phone: restaurant.owner.phone
      }
    }))

    return NextResponse.json(formattedRestaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้านอาหาร' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 