# Add-ons System Documentation

## ภาพรวม
ระบบ Add-ons ใน AriFood ช่วยให้ลูกค้าสามารถเพิ่มเติมรายการอาหารได้ เช่น ไข่ดาว, แฮม, ชีส เป็นต้น

## Database Schema

### 1. AddOn Model
```prisma
model AddOn {
  id          String    @id @default(cuid())
  name        String    // ชื่อ add-on เช่น "ไข่ดาว"
  price       Float     // ราคาเพิ่มเติม
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  products    ProductAddOn[]
  orderItems  OrderItemAddOn[]
}
```

### 2. ProductAddOn Model (Many-to-Many Relation)
```prisma
model ProductAddOn {
  id        String   @id @default(cuid())
  productId String
  addOnId   String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  addOn     AddOn    @relation(fields: [addOnId], references: [id], onDelete: Cascade)
  
  @@unique([productId, addOnId])
}
```

### 3. OrderItemAddOn Model (สำหรับเก็บ add-ons ในออเดอร์)
```prisma
model OrderItemAddOn {
  id          String @id @default(cuid())
  orderItemId String
  addOnId     String
  quantity    Int    @default(1)
  price       Float  // ราคา add-on ณ เวลาที่สั่ง
  
  orderItem   OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)
  addOn       AddOn     @relation(fields: [addOnId], references: [id])
  
  @@unique([orderItemId, addOnId])
}
```

## API Endpoints

### GET /api/products/[slug]
ส่งข้อมูล product พร้อม add-ons ที่เกี่ยวข้อง

**Response:**
```json
{
  "id": "product_id",
  "name": "ผัดไทยกุ้งสด",
  "price": 80.00,
  "addOns": [
    {
      "id": "relation_id",
      "addOn": {
        "id": "addon_id",
        "name": "ไข่ดาว",
        "price": 10.00,
        "isActive": true
      }
    }
  ]
}
```

## Frontend Implementation

### Product Detail Page
- แสดง checkbox สำหรับแต่ละ add-on
- คำนวณราคารวมแบบ real-time
- เก็บ add-ons ที่เลือกไว้ใน cart

### การใช้งาน
```tsx
// ได้ add-ons จาก database
const extraOptions: ExtraOption[] = product?.addOns?.map(addOnRelation => ({
  id: addOnRelation.addOn.id,
  name: addOnRelation.addOn.name,
  price: addOnRelation.addOn.price,
})) || [];

// คำนวณราคารวม
const calculateTotalPrice = () => {
  if (!product) return 0;
  
  const extraPrice = extraOptions.reduce((total, option) => {
    return selectedOptions[option.id] ? total + option.price : total;
  }, 0);
  
  return (product.price + extraPrice) * quantity;
};
```

## การ Seed ข้อมูล

### 1. Seed Add-ons
```bash
npm run db:seed-addons
```

### 2. Add-ons ที่มีในระบบ
- ไข่ดาว (฿10)
- ไข่เจียว (฿15)
- แฮม (฿20)
- เบคอน (฿25)
- ชีส (฿15)
- เห็ด (฿12)
- ไส้กรอก (฿18)
- หมูยอ (฿22)
- ข้าวเพิ่ม (฿8)
- ผักเพิ่ม (฿5)

### 3. การแมป Add-ons กับหมวดหมู่
- **อาหารคาว/กิมจิ/อาหารไทย**: ไข่ดาว, ไข่เจียว, แฮม, เบคอน, ข้าวเพิ่ม, ผักเพิ่ม
- **ก๋วยเตี๋ยว**: ไข่ดาว, หมูยอ, ไส้กรอก, เห็ด, ผักเพิ่ม
- **ขนมหวาน**: ชีส, เห็ด (สำหรับขนมคาว)
- **เครื่องดื่ม**: ไม่มี add-ons

## การจัดการ Add-ons

### เพิ่ม Add-on ใหม่
```sql
INSERT INTO AddOn (id, name, price, isActive) 
VALUES ('new_id', 'ชื่อ add-on', 15.00, true);
```

### เชื่อมต่อ Add-on กับ Product
```sql
INSERT INTO ProductAddOn (id, productId, addOnId, isActive) 
VALUES ('relation_id', 'product_id', 'addon_id', true);
```

### ปิดการใช้งาน Add-on
```sql
UPDATE AddOn SET isActive = false WHERE id = 'addon_id';
-- หรือ
UPDATE ProductAddOn SET isActive = false WHERE productId = 'product_id' AND addOnId = 'addon_id';
```

## Features

### ✅ ที่ทำเสร็จแล้ว
- Database schema สำหรับ add-ons
- API endpoint ส่ง add-ons พร้อม product
- UI สำหรับเลือก add-ons
- การคำนวณราคารวม
- การ seed ข้อมูล add-ons

### 🚧 ที่ยังต้องทำ
- บันทึก add-ons ลงใน order
- หน้าจัดการ add-ons สำหรับ admin
- การแก้ไข add-ons ในตะกร้า
- รายงานยอดขาย add-ons

## การทดสอบ

1. เข้าหน้า product detail: `/products/[slug]`
2. ตรวจสอบว่ามี add-ons แสดงขึ้นมา
3. เลือก add-ons และดูการเปลี่ยนแปลงราคา
4. เพิ่มลงตะกร้าและตรวจสอบข้อมูล

## ตัวอย่างการใช้งาน

### กระเพราหมูสับ + ไข่ดาว
- ราคาฐาน: ฿45
- เพิ่มไข่ดาว: +฿10
- **รวม: ฿55**

### ก๋วยเตี๋ยวหมูแดง + หมูยอ + เห็ด
- ราคาฐาน: ฿40
- เพิ่มหมูยอ: +฿22
- เพิ่มเห็ด: +฿12
- **รวม: ฿74** 