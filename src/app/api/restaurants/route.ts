import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all restaurants
export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { isActive: true },
          include: {
            category: true
          }
        },
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Get restaurants error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้านค้า' },
      { status: 500 }
    );
  }
}

// Create new restaurant (for admin)
export async function POST(request: NextRequest) {
  try {
    const { name, slug, description, address, latitude, longitude, phone, email, ownerId } = await request.json();

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        address,
        latitude,
        longitude,
        phone,
        email,
        ownerId
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error('Create restaurant error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างร้านค้า' },
      { status: 500 }
    );
  }
} 