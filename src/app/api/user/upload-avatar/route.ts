import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('avatar') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'ไม่พบไฟล์รูปภาพหรือ user ID' },
        { status: 400 }
      )
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'ประเภทไฟล์ไม่ถูกต้อง กรุณาใช้ JPG, PNG หรือ WebP' },
        { status: 400 }
      )
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 15MB' },
        { status: 400 }
      )
    }

    // ดึงข้อมูลผู้ใช้เพื่อตรวจสอบรูปเดิม
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้' },
        { status: 404 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // สร้างชื่อไฟล์ใหม่
    const fileName = `avatar-${userId}-${randomUUID()}.webp` // บังคับให้เป็น webp เพื่อประหยัดที่เก็บข้อมูล
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'avatars', fileName)

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    const { mkdir } = await import('fs/promises')
    const uploadDir = path.dirname(uploadPath)
    await mkdir(uploadDir, { recursive: true })

    // Resize รูปภาพเป็น 200x200 px และแปลงเป็น WebP เพื่อประหยัดที่เก็บข้อมูล
    const resizedBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 90,
        effort: 3  // ใช้ effort น้อยลงเพื่อความเร็ว (0-6, default: 4)
      })
      .toBuffer()

    // บันทึกไฟล์
    await writeFile(uploadPath, resizedBuffer)

    // ลบรูปเดิมถ้ามี
    if (currentUser.avatar) {
      try {
        const oldImagePath = path.join(process.cwd(), 'public', currentUser.avatar)
        await unlink(oldImagePath)
        console.log(`ลบรูปเดิมแล้ว: ${oldImagePath}`)
      } catch (error) {
        console.log('ไม่สามารถลบรูปเดิมได้ (อาจถูกลบไปแล้วหรือไม่มีอยู่):', error)
      }
    }

    // อัพเดตฐานข้อมูล
    const avatarUrl = `/uploads/avatars/${fileName}`
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        lineUserId: true,
        avatar: true,
        role: true
      }
    })

    return NextResponse.json({
      message: 'อัพโหลดรูปโปรไฟล์สำเร็จ',
      user: updatedUser,
      avatarUrl
    })

  } catch (error) {
    console.error('Upload avatar error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 