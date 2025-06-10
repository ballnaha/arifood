import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyCustomer } from '@/lib/socket'

// PATCH /api/orders/[id] - อัพเดทสถานะออเดอร์
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // อัพเดทสถานะออเดอร์
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        restaurant: {
          select: {
            name: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // ส่งการแจ้งเตือนไปยังลูกค้า (ถ้ามี customer ID)
    if (updatedOrder.customerId) {
      const notificationData = {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        restaurantName: updatedOrder.restaurant.name,
        message: getStatusMessage(updatedOrder.status),
        updatedAt: new Date().toISOString()
      }

      notifyCustomer(updatedOrder.customerId, notificationData)
    }

    console.log('📝 อัพเดทสถานะออเดอร์:', {
      orderNumber: updatedOrder.orderNumber,
      oldStatus: 'unknown',
      newStatus: status,
      customer: updatedOrder.customerName
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'อัพเดทสถานะสำเร็จ'
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}

// GET /api/orders/[id] - ดึงข้อมูลออเดอร์ตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
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
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// ฟังก์ชันสำหรับสร้างข้อความสถานะ
function getStatusMessage(status: string): string {
  const statusMessages: Record<string, string> = {
    PENDING: 'ออเดอร์ของคุณรอการยืนยันจากร้าน',
    CONFIRMED: 'ร้านยืนยันออเดอร์แล้ว กำลังเตรียมอาหาร',
    PREPARING: 'กำลังเตรียมอาหารของคุณ',
    READY_FOR_PICKUP: 'อาหารพร้อมแล้ว รอไรเดอร์มารับ',
    ASSIGNED_RIDER: 'จัดไรเดอร์แล้ว กำลังไปรับอาหาร',
    PICKED_UP: 'ไรเดอร์รับอาหารแล้ว กำลังเดินทางไปหาคุณ',
    OUT_FOR_DELIVERY: 'กำลังจัดส่งอาหารไปหาคุณ',
    DELIVERED: 'จัดส่งสำเร็จแล้ว ขอบคุณที่ใช้บริการ',
    CANCELLED: 'ออเดอร์ถูกยกเลิก'
  }
  
  return statusMessages[status] || 'สถานะออเดอร์เปลี่ยนแปลง'
} 