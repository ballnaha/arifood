# การตั้งค่า LINE Login สำหรับ AriFood

## ขั้นตอนการตั้งค่า LINE Developers

### 1. สร้าง LINE Login Channel
1. เข้าไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง Provider หรือเลือก Provider ที่มีอยู่แล้ว
3. คลิก "Create a new channel"
4. เลือก "LINE Login"
5. กรอกข้อมูลช่อง:
   - **Channel name**: AriFood
   - **Channel description**: ระบบสั่งอาหารออนไลน์
   - **App type**: Web app
   - **Email address**: อีเมลของคุณ

### 2. ตั้งค่า Channel
1. ใน Channel settings ให้ตั้งค่า:
   - **Callback URL**: `http://localhost:3000/api/auth/line/callback` (สำหรับ development)
   - **Callback URL**: `https://ari.treetelu.com/api/auth/line/callback` (สำหรับ production)

2. ใน Channel scopes ให้เปิดใช้งาน:
   - `profile` - ข้อมูลโปรไฟล์พื้นฐาน
   - `openid` - สำหรับ OpenID Connect
   - `email` - อีเมล (ถ้าผู้ใช้อนุญาต)

### 3. รับ Client ID และ Client Secret
1. ไปที่แท็บ "Basic settings"
2. คัดลอก **Channel ID** (นี่คือ Client ID)
3. คัดลอก **Channel secret** (นี่คือ Client Secret)

## การตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root ของโปรเจค:

```env
# LINE Login Configuration
NEXT_PUBLIC_LINE_CLIENT_ID="your_channel_id_here"
LINE_CLIENT_SECRET="your_channel_secret_here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # สำหรับ development
# NEXT_PUBLIC_APP_URL="https://ari.treetelu.com"  # สำหรับ production
```

## ฟีเจอร์ LINE Login

### ข้อจำกัดของ LINE Login
- ผู้ใช้ที่ login ด้วย LINE จะถูกตั้งค่าเป็น **CUSTOMER** เท่านั้น
- ไม่สามารถสร้างบัญชีร้านอาหารผ่าน LINE ได้
- ต้องสมัครผ่านฟอร์มปกติหากต้องการเป็น Restaurant Owner

### การทำงาน
1. ผู้ใช้คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"
2. ระบบจะ redirect ไป LINE OAuth
3. ผู้ใช้ authorize ในแอป LINE
4. LINE ส่ง callback พร้อม authorization code
5. ระบบแลก code เป็น access token
6. ดึงข้อมูลโปรไฟล์จาก LINE API
7. สร้างหรืออัพเดทผู้ใช้ในฐานข้อมูล (role = CUSTOMER)
8. redirect ไปหน้าแสดงความสำเร็จ
9. อัพเดท UserContext และ redirect ไปหน้าหลัก

### ข้อมูลที่เก็บ
- `lineUserId`: LINE User ID (unique)
- `name`: ชื่อจาก LINE profile
- `email`: อีเมลจาก LINE (หากมี) หรือสร้างเป็น `{lineUserId}@line.user`
- `password`: เป็นค่าว่าง (ไม่ต้องใช้รหัสผ่าน)
- `role`: CUSTOMER เสมอ
- `phone`, `address`: ให้ผู้ใช้กรอกภายหลังในหน้า Profile

## การทดสอบ

### Development
1. ตั้งค่า callback URL เป็น `http://localhost:3000/api/auth/line/callback`
2. รัน `npm run dev`
3. เข้าหน้า `/login`
4. คลิกปุ่ม "เข้าสู่ระบบด้วย LINE"

### Production
1. เปลี่ยน callback URL เป็น `https://ari.treetelu.com/api/auth/line/callback`
2. อัพเดท `NEXT_PUBLIC_APP_URL="https://ari.treetelu.com"` ใน environment variables
3. deploy โปรเจค

## Troubleshooting

### ข้อผิดพลาดที่พบบ่อย
1. **line_auth_failed**: ตรวจสอบ Client ID และ Callback URL
2. **line_token_failed**: ตรวจสอบ Client Secret
3. **line_profile_failed**: ตรวจสอบ scopes ใน LINE console

### การ Debug
- ดูใน browser developer tools สำหรับ network requests
- ตรวจสอบ console.log ใน API route
- ตรวจสอบข้อมูลใน database หลังจาก login สำเร็จ 