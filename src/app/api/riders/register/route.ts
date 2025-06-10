import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

const riderRegistrationSchema = z.object({
  // User Information
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  phone: z.string().regex(/^[0-9]{10}$/, 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก'),
  address: z.string().min(10, 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร'),
  
  // Rider Specific Information
  licenseNumber: z.string().optional(),
  vehicleType: z.enum(['MOTORCYCLE', 'BICYCLE', 'CAR', 'WALK']),
  vehiclePlate: z.string().optional(),
  bankAccount: z.string().min(10, 'เลขบัญชีต้องมีอย่างน้อย 10 หลัก'),
  bankName: z.string().min(2, 'ชื่อธนาคารต้องมีอย่างน้อย 2 ตัวอักษร'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = riderRegistrationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // Validate license requirement for vehicles
    if ((data.vehicleType === 'MOTORCYCLE' || data.vehicleType === 'CAR') && !data.licenseNumber) {
      return NextResponse.json(
        { error: 'กรุณากรอกหมายเลขใบขับขี่สำหรับยานพาหนะประเภทนี้' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user and rider profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phone: data.phone,
          address: data.address,
          role: 'RIDER',
          isActive: true,
        }
      })

      // Create rider profile
      const rider = await tx.rider.create({
        data: {
          userId: user.id,
          licenseNumber: data.licenseNumber,
          vehicleType: data.vehicleType,
          vehiclePlate: data.vehiclePlate,
          bankAccount: data.bankAccount,
          bankName: data.bankName,
          status: 'PENDING', // Default to pending approval
          isOnline: false,
          rating: 0,
          totalDeliveries: 0,
        }
      })

      return { user, rider }
    })

    return NextResponse.json(
      {
        message: 'สมัครไรเดอร์สำเร็จ! รอการอนุมัติจากทีมงาน',
        userId: result.user.id,
        riderId: result.rider.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Rider registration error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัคร กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 