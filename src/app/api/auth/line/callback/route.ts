import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@/generated/prisma'

const prisma = new PrismaClient()
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ari.treetelu.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=line_auth_failed', baseUrl))
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${baseUrl}/api/auth/line/callback`,
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '',
        client_secret: process.env.LINE_CLIENT_SECRET || '',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Failed to get access token:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/login?error=line_token_failed', baseUrl))
    }

    const tokenData = await tokenResponse.json()

    // Get user profile from LINE
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!profileResponse.ok) {
      console.error('Failed to get user profile:', await profileResponse.text())
      return NextResponse.redirect(new URL('/login?error=line_profile_failed', baseUrl))
    }

    const lineProfile = await profileResponse.json()
    
    // Debug: ตรวจสอบข้อมูลจาก LINE API
    console.log('=== LINE Profile Debug ===')
    console.log('LINE Profile:', JSON.stringify(lineProfile, null, 2))
    console.log('displayName:', lineProfile.displayName)
    console.log('userId:', lineProfile.userId)
    console.log('========================')

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { lineUserId: lineProfile.userId },
          { email: lineProfile.email || `${lineProfile.userId}@line.user` }
        ]
      },
      include: {
        restaurant: true
      }
    })

    // Create new user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: lineProfile.displayName || `ผู้ใช้ LINE ${lineProfile.userId.slice(-4)}`, // fallback name ภาษาไทย
          email: lineProfile.email || `${lineProfile.userId}@line.user`,
          password: '', // LINE users don't need password
          role: UserRole.CUSTOMER, // บังคับให้เป็น CUSTOMER เท่านั้น
          lineUserId: lineProfile.userId,
          phone: '', // จะให้กรอกภายหลัง
          address: '', // จะให้กรอกภายหลัง
        },
        include: {
          restaurant: true
        }
      })
    } else {
      // Update LINE user ID and name every time login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          lineUserId: lineProfile.userId,
          name: lineProfile.displayName || user.name || `ผู้ใช้ LINE ${lineProfile.userId.slice(-4)}`, // อัพเดตชื่อ + fallback ภาษาไทย
        },
        include: {
          restaurant: true
        }
      })
    }

    // Debug: ตรวจสอบข้อมูล user หลังการสร้าง/อัพเดต
    console.log('=== User Data After Create/Update ===')
    console.log('User:', JSON.stringify(user, null, 2))
    console.log('user.name:', user.name)
    console.log('user.lineUserId:', user.lineUserId)
    console.log('=====================================')

    // Generate response with user data
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      lineUserId: user.lineUserId,
      role: user.role,
      restaurant: user.restaurant ? {
        id: user.restaurant.id,
        name: user.restaurant.name,
        description: user.restaurant.description,
        address: user.restaurant.address,
        phone: user.restaurant.phone,
        rating: user.restaurant.rating,
        deliveryTime: user.restaurant.deliveryTime
      } : null
    }

    // Redirect to success page with user data
    const successUrl = new URL('/login/line-success', baseUrl)
    successUrl.searchParams.set('user', encodeURIComponent(JSON.stringify(userData)))
    
    return NextResponse.redirect(successUrl)

  } catch (error) {
    console.error('LINE callback error:', error)
    return NextResponse.redirect(new URL('/login?error=line_callback_failed', baseUrl))
  } finally {
    await prisma.$disconnect()
  }
} 