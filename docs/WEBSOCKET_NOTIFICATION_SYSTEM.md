# ระบบการแจ้งเตือนผ่าน WebSocket

ระบบนี้ใช้ Socket.IO สำหรับการส่งการแจ้งเตือนแบบเรียลไทม์เมื่อลูกค้าสั่งอาหาร

## โครงสร้างระบบ

### 1. Socket.IO Server
- **ไฟล์**: `pages/api/socket.ts`
- **หน้าที่**: จัดการการเชื่อมต่อ WebSocket และ room management

### 2. Socket Utilities
- **ไฟล์**: `src/lib/socket.ts`
- **หน้าที่**: ฟังก์ชันสำหรับส่งการแจ้งเตือนไปยังผู้ใช้ต่างๆ

### 3. Socket Hook
- **ไฟล์**: `src/hooks/useSocket.ts`
- **หน้าที่**: React hook สำหรับใช้ Socket.IO ใน client

## การทำงานของระบบ

### 1. เมื่อลูกค้าสั่งอาหาร
```
ลูกค้า → API Orders → Database → ส่งการแจ้งเตือนผ่าน WebSocket → ร้านอาหาร
```

### 2. เมื่อร้านอาหารอัพเดทสถานะ
```
ร้านอาหาร → API Orders Update → Database → ส่งการแจ้งเตือนผ่าน WebSocket → ลูกค้า
```

## Room Management

### Restaurant Room
- **รูปแบบ**: `restaurant-{restaurantId}`
- **ผู้เข้าร่วม**: เจ้าของร้านอาหาร
- **เหตุการณ์**: `new-order` - ออเดอร์ใหม่

### Customer Room
- **รูปแบบ**: `customer-{customerId}`
- **ผู้เข้าร่วม**: ลูกค้า
- **เหตุการณ์**: `order-update` - อัพเดทสถานะออเดอร์

### Rider Room
- **รูปแบบ**: `rider-{riderId}`
- **ผู้เข้าร่วม**: ไรเดอร์
- **เหตุการณ์**: `delivery-update` - อัพเดทการจัดส่ง

## การใช้งานในโค้ด

### 1. การส่งการแจ้งเตือนจาก Server
```typescript
import { notifyRestaurant } from '@/lib/socket';

// ส่งการแจ้งเตือนไปยังร้านอาหาร
const notificationData = {
  orderId: order.id,
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  // ... ข้อมูลอื่นๆ
};

notifyRestaurant(restaurantId, notificationData);
```

### 2. การรับการแจ้งเตือนใน Client
```typescript
import useSocket from '@/hooks/useSocket';

function RestaurantDashboard() {
  const { isConnected, joinRoom, on, off } = useSocket();

  useEffect(() => {
    // เข้าร่วมห้องร้านอาหาร
    if (isConnected) {
      joinRoom('restaurant', restaurantId);
    }
  }, [isConnected]);

  useEffect(() => {
    // ฟังการแจ้งเตือนออเดอร์ใหม่
    const handleNewOrder = (orderData) => {
      console.log('ได้รับออเดอร์ใหม่:', orderData);
      // อัพเดท UI
    };

    on('new-order', handleNewOrder);

    return () => {
      off('new-order', handleNewOrder);
    };
  }, [on, off]);
}
```

## ข้อมูลที่ส่งในการแจ้งเตือน

### การแจ้งเตือนออเดอร์ใหม่ (new-order)
```typescript
{
  orderId: string,
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  totalAmount: number,
  items: Array<{
    name: string,
    quantity: number,
    price: number,
    instructions?: string,
    addOns?: string
  }>,
  specialInstructions?: string,
  createdAt: string,
  restaurantId: string,
  restaurantName: string
}
```

### การแจ้งเตือนอัพเดทสถานะ (order-update)
```typescript
{
  orderId: string,
  orderNumber: string,
  status: string,
  restaurantName: string,
  message: string,
  updatedAt: string
}
```

## ฟีเจอร์พิเศษ

### 1. เสียงแจ้งเตือน
- ใช้ Web Audio API สร้างเสียงแจ้งเตือนเมื่อมีออเดอร์ใหม่
- ทำงานได้เฉพาะในเบราว์เซอร์ที่รองรับ

### 2. การนับออเดอร์ใหม่
- นับจำนวนออเดอร์ที่ยังไม่ได้ดู
- แสดงเป็น badge ที่ไอคอนการแจ้งเตือน

### 3. การจัดการการเชื่อมต่อ
- Reconnection อัตโนมัติเมื่อขาดการเชื่อมต่อ
- แสดงสถานะการเชื่อมต่อในหน้า dashboard

## การทดสอบระบบ

### 1. เริ่มต้น Socket.IO Server
Socket.IO server จะเริ่มต้นอัตโนมัติเมื่อมีการเรียก `/api/socket`

### 2. ทดสอบการสั่งอาหาร
1. เข้าหน้า Cart (`/cart`)
2. เพิ่มสินค้าลงตะกร้า
3. กดปุ่ม "สั่งซื้อ"
4. กรอกข้อมูลลูกค้าและยืนยัน

### 3. ทดสอบการรับแจ้งเตือน
1. เปิดหน้า Restaurant Dashboard (`/restaurant/dashboard`)
2. สั่งอาหารจากหน้าอื่น
3. ตรวจสอบว่ามีการแจ้งเตือนปรากฏขึ้นหรือไม่

## การแก้ไขปัญหา

### ปัญหาการเชื่อมต่อ
- ตรวจสอบว่า Socket.IO server ทำงานหรือไม่
- ดู Console เพื่อหาข้อผิดพลาด
- ตรวจสอบ CORS settings

### ปัญหาไม่ได้รับการแจ้งเตือน
- ตรวจสอบว่าเข้าร่วม room ถูกต้องหรือไม่
- ดูใน Console ว่ามีการส่งข้อมูลหรือไม่
- ตรวจสอบ restaurantId ที่ใช้ในการส่งการแจ้งเตือน

## การปรับแต่งเพิ่มเติม

### 1. การเพิ่มเสียงแจ้งเตือนแบบอื่น
```typescript
const playCustomSound = (audioFile: string) => {
  const audio = new Audio(audioFile);
  audio.play().catch(console.error);
};
```

### 2. การเพิ่ม Push Notifications
```typescript
// ขอสิทธิ์การแจ้งเตือน
if ('Notification' in window) {
  Notification.requestPermission();
}

// ส่งการแจ้งเตือน
const showNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
};
```

### 3. การจัดเก็บการแจ้งเตือนในฐานข้อมูล
สามารถเพิ่มตาราง `Notification` เพื่อเก็บประวัติการแจ้งเตือน

## สรุป

ระบบการแจ้งเตือนผ่าน WebSocket ช่วยให้ร้านอาหารสามารถรับทราบออเดอร์ใหม่ได้ทันทีแบบเรียลไทม์ โดยไม่ต้องรีเฟรชหน้าเว็บ ทำให้การบริการมีประสิทธิภาพมากยิ่งขึ้น 