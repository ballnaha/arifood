import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get products for specific restaurant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await prisma.product.findMany({
      where: {
        restaurantId: id,
        isActive: true
      },
      include: {
        category: true,
        restaurant: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Get restaurant products error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลอาหาร' },
      { status: 500 }
    );
  }
}

// Create new product for restaurant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'ไม่พบ token การยืนยันตัวตน' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { owner: true }
    });

    if (!restaurant || restaurant.ownerId !== decoded.userId) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์เพิ่มอาหารในร้านนี้' },
        { status: 403 }
      );
    }

    const { name, description, price, originalPrice, image, categoryId } = await request.json();

    const product = await prisma.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        image,
        categoryId,
        restaurantId: id
      },
      include: {
        category: true,
        restaurant: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มอาหาร' },
      { status: 500 }
    );
  }
} 