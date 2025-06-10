import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, restaurantData } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData: any = {
      email,
      password: hashedPassword,
      name,
      role: role || 'CUSTOMER'
    };

    // If restaurant owner, create restaurant too
    if (role === 'RESTAURANT_OWNER' && restaurantData) {
      const user = await prisma.user.create({
        data: {
          ...userData,
          restaurant: {
            create: {
              name: restaurantData.name,
              slug: restaurantData.name.toLowerCase().replace(/\s+/g, '-'),
              description: restaurantData.description,
              address: restaurantData.address,
              phone: restaurantData.phone,
              email: restaurantData.email,
              status: 'PENDING'  // ร้านใหม่ต้องรออนุมัติ
            }
          }
        },
        include: {
          restaurant: true
        }
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurant: user.restaurant
        },
        token
      });
    } else {
      const user = await prisma.user.create({
        data: userData
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างบัญชี' },
      { status: 500 }
    );
  }
}

// Login
export async function PUT(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurant: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        lineUserId: user.lineUserId,
        avatar: user.avatar, // เพิ่ม avatar field
        role: user.role,
        restaurant: user.restaurant
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
} 