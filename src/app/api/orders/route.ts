import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyRestaurant } from '@/lib/socket'

// GET /api/orders - ดึงข้อมูล orders (สำหรับ admin หรือ restaurant)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status')
    
    let where: any = {}
    
    if (restaurantId) {
      where.restaurantId = restaurantId
    }
    
    if (status) {
      where.status = status
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        rider: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true
              }
            },
            addOns: {
              include: {
                addOn: {
                  select: {
                    id: true,
                    name: true,
                    price: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - สร้าง order ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerInfo,
      items,
      restaurantId,
      subtotalAmount,
      deliveryFee = 30,
      totalAmount,
      paymentMethod = 'CASH',
      specialInstructions
    } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!customerInfo || !items || !restaurantId || !subtotalAmount || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // สร้าง order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // สร้าง order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerInfo.userId || null,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        customerLatitude: customerInfo.latitude || null,
        customerLongitude: customerInfo.longitude || null,
        restaurantId,
        subtotalAmount,
        deliveryFee,
        totalAmount,
        paymentMethod,
        specialInstructions,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            instructions: item.instructions || null,
            addOns: item.addOns ? {
              create: item.addOns.map((addOn: any) => ({
                addOnId: addOn.id,
                quantity: addOn.quantity || 1,
                price: addOn.price
              }))
            } : undefined
          }))
        }
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            ownerId: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            addOns: {
              include: {
                addOn: {
                  select: {
                    name: true,
                    price: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // ส่งการแจ้งเตือนไปยังร้านอาหารผ่าน WebSocket
    const notificationData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      totalAmount: order.totalAmount,
      items: order.orderItems.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        instructions: item.instructions,
        addOns: item.addOns.map((addon: any) => addon.addOn.name).join(', ')
      })),
      specialInstructions: order.specialInstructions,
      createdAt: order.createdAt,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurant.name
    }

    // ส่งแจ้งเตือนไปยังร้านอาหาร
    const notificationSent = notifyRestaurant(restaurantId, notificationData)
    
    console.log('🎉 สร้างออเดอร์ใหม่สำเร็จ:', {
      orderNumber: order.orderNumber,
      restaurant: order.restaurant.name,
      customer: order.customerName,
      total: order.totalAmount,
      notificationSent
    })
    
    return NextResponse.json({
      success: true,
      order,
      notificationSent,
      message: 'สั่งอาหารเรียบร้อยแล้ว ร้านอาหารได้รับการแจ้งเตือนแล้ว'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 