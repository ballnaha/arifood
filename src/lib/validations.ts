import { z } from 'zod'

// ============ ข้อมูลผู้ใช้ ============
export const userProfileSchema = z.object({
  name: z.string()
    .min(1, 'กรุณากรอกชื่อ-นามสกุล')
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  
  email: z.string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์')
    .regex(/^0\d{8,9}$/, 'เบอร์โทรต้องเริ่มต้นด้วย 0 และมี 9-10 หลัก (เช่น 0812345678)')
    .min(9, 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก')
    .max(10, 'เบอร์โทรต้องไม่เกิน 10 หลัก'),
  
  address: z.string()
    .min(1, 'กรุณากรอกที่อยู่')
    .min(10, 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(500, 'ที่อยู่ต้องไม่เกิน 500 ตัวอักษร'),
})

// ============ ข้อมูลร้านอาหาร ============
export const restaurantSchema = z.object({
  name: z.string()
    .min(1, 'กรุณากรอกชื่อร้าน')
    .min(2, 'ชื่อร้านต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อร้านต้องไม่เกิน 100 ตัวอักษร'),
  
  description: z.string()
    .min(1, 'กรุณากรอกคำอธิบายร้าน')
    .min(10, 'คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(1000, 'คำอธิบายต้องไม่เกิน 1000 ตัวอักษร'),
  
  address: z.string()
    .min(1, 'กรุณากรอกที่อยู่ร้าน')
    .min(15, 'ที่อยู่ร้านต้องมีอย่างน้อย 15 ตัวอักษร')
    .max(500, 'ที่อยู่ร้านต้องไม่เกิน 500 ตัวอักษร'),
  
  phone: z.string()
    .min(1, 'กรุณากรอกเบอร์โทรร้าน')
    .regex(/^0\d{8,9}$/, 'เบอร์โทรต้องเริ่มต้นด้วย 0 และมี 9-10 หลัก (เช่น 0812345678)')
    .min(9, 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก')
    .max(10, 'เบอร์โทรต้องไม่เกิน 10 หลัก'),
  
  email: z.string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  
  deliveryTime: z.string()
    .min(1, 'กรุณากรอกเวลาจัดส่ง')
    .regex(/^\d+-\d+\s*นาที$/, 'รูปแบบเวลาจัดส่งไม่ถูกต้อง เช่น "30-45 นาที"'),
})

// ============ การเข้าสู่ระบบ ============
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง'),
  
  password: z.string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
})

// ============ การสมัครสมาชิก ============
export const registerSchema = z.object({
  name: z.string()
    .min(1, 'กรุณากรอกชื่อ-นามสกุล')
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  
  email: z.string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง'),
  
  password: z.string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(50, 'รหัสผ่านต้องไม่เกิน 50 ตัวอักษร'),
  
  confirmPassword: z.string()
    .min(1, 'กรุณายืนยันรหัสผ่าน'),
  
  role: z.enum(['CUSTOMER', 'RESTAURANT_OWNER'], {
    errorMap: () => ({ message: 'กรุณาเลือกประเภทบัญชี' })
  }),
  
  phone: z.string()
    .min(1, 'กรุณากรอกเบอร์โทรศัพท์')
    .regex(/^0\d{8,9}$/, 'เบอร์โทรต้องเริ่มต้นด้วย 0 และมี 9-10 หลัก (เช่น 0812345678)')
    .min(9, 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก')
    .max(10, 'เบอร์โทรต้องไม่เกิน 10 หลัก'),
  
  // ข้อมูลร้านอาหาร (เฉพาะกรณีเป็นเจ้าของร้าน)
  restaurantName: z.string().optional(),
  restaurantDescription: z.string().optional(),
  restaurantAddress: z.string().optional(),
  restaurantPhone: z.string().optional(),
  restaurantEmail: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
}).refine((data) => {
  // ถ้าเป็นเจ้าของร้าน ต้องกรอกข้อมูลร้าน
  if (data.role === 'RESTAURANT_OWNER') {
    return data.restaurantName && data.restaurantDescription && data.restaurantAddress
  }
  return true
}, {
  message: "กรุณากรอกข้อมูลร้านอาหารให้ครบถ้วน",
  path: ["restaurantName"],
})

// ============ การเปลี่ยนรหัสผ่าน ============
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
  
  newPassword: z.string()
    .min(1, 'กรุณากรอกรหัสผ่านใหม่')
    .min(6, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
    .max(50, 'รหัสผ่านใหม่ต้องไม่เกิน 50 ตัวอักษร'),
  
  confirmPassword: z.string()
    .min(1, 'กรุณายืนยันรหัสผ่านใหม่'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านใหม่ไม่ตรงกัน",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "รหัสผ่านใหม่ต้องต่างจากรหัสผ่านเดิม",
  path: ["newPassword"],
})

// ============ ข้อมูลสินค้า ============
export const productSchema = z.object({
  name: z.string()
    .min(1, 'กรุณากรอกชื่อสินค้า')
    .min(2, 'ชื่อสินค้าต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อสินค้าต้องไม่เกิน 100 ตัวอักษร'),
  
  description: z.string()
    .min(1, 'กรุณากรอกคำอธิบายสินค้า')
    .min(10, 'คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร'),
  
  price: z.number()
    .min(1, 'ราคาต้องมากกว่า 0')
    .max(10000, 'ราคาต้องไม่เกิน 10,000 บาท'),
  
  originalPrice: z.number()
    .min(0, 'ราคาเดิมต้องไม่น้อยกว่า 0')
    .optional(),
  
  categoryId: z.string()
    .min(1, 'กรุณาเลือกหมวดหมู่สินค้า'),
  
  isActive: z.boolean().default(true),
})

// ============ การติดต่อ/สอบถาม ============
export const contactSchema = z.object({
  name: z.string()
    .min(1, 'กรุณากรอกชื่อ')
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  
  email: z.string()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง'),
  
  subject: z.string()
    .min(1, 'กรุณากรอกหัวข้อ')
    .min(5, 'หัวข้อต้องมีอย่างน้อย 5 ตัวอักษร')
    .max(200, 'หัวข้อต้องไม่เกิน 200 ตัวอักษร'),
  
  message: z.string()
    .min(1, 'กรุณากรอกข้อความ')
    .min(10, 'ข้อความต้องมีอย่างน้อย 10 ตัวอักษร')
    .max(1000, 'ข้อความต้องไม่เกิน 1000 ตัวอักษร'),
})

// ============ การค้นหา ============
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'กรุณากรอกคำค้นหา')
    .max(100, 'คำค้นหาต้องไม่เกิน 100 ตัวอักษร'),
  
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  location: z.string().optional(),
})

// ============ Types ============
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type RestaurantInput = z.infer<typeof restaurantSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ProductInput = z.infer<typeof productSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type SearchInput = z.infer<typeof searchSchema> 