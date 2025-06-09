import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const { id, currentPassword, newPassword } = await request.json()

    if (!id || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      )
    }

    // ค้นหาผู้ใช้
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้ในระบบ' },
        { status: 404 }
      )
    }

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // แฮชรหัสผ่านใหม่
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // อัพเดทรหัสผ่าน
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword
      }
    })

    return NextResponse.json({
      message: 'เปลี่ยนรหัสผ่านสำเร็จ'
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 