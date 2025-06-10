import { PrismaClient, UserRole, RestaurantStatus, RiderStatus, VehicleType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@arifood.com' },
    update: {},
    create: {
      email: 'admin@arifood.com',
      password: adminPassword,
      name: 'ผู้ดูแลระบบ',
      role: UserRole.ADMIN,
      phone: '0123456789',
      address: 'Bangkok, Thailand',
      latitude: 13.736717,
      longitude: 100.523186,
    },
  })

  // Create customers
  const customer1Password = await bcrypt.hash('customer123', 10)
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@arifood.com' },
    update: {},
    create: {
      email: 'customer1@arifood.com',
      password: customer1Password,
      name: 'ลูกค้าทดสอบ 1',
      role: UserRole.CUSTOMER,
      phone: '0987654321',
      address: 'ซอยรามคำแหง 12, กรุงเทพฯ',
      latitude: 13.7563,
      longitude: 100.5018,
    },
  })

  const customer2Password = await bcrypt.hash('customer123', 10)
  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@arifood.com' },
    update: {},
    create: {
      email: 'customer2@arifood.com',
      password: customer2Password,
      name: 'ลูกค้าทดสอบ 2',
      role: UserRole.CUSTOMER,
      phone: '0876543210',
      address: 'เพลินจิต, กรุงเทพฯ',
      latitude: 13.7440,
      longitude: 100.5490,
    },
  })

  // Create restaurant owners
  const owner1Password = await bcrypt.hash('owner123', 10)
  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@arifood.com' },
    update: {},
    create: {
      email: 'owner1@arifood.com',
      password: owner1Password,
      name: 'เจ้าของร้าน ก๋วยเตี๋ยว',
      role: UserRole.RESTAURANT_OWNER,
      phone: '0812345678',
      address: 'ตลาดนัด JJ, กรุงเทพฯ',
    },
  })

  const owner2Password = await bcrypt.hash('owner123', 10)
  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@arifood.com' },
    update: {},
    create: {
      email: 'owner2@arifood.com',
      password: owner2Password,
      name: 'เจ้าของร้าน ข้าวผัด',
      role: UserRole.RESTAURANT_OWNER,
      phone: '0823456789',
      address: 'ซอยสุขุมวิท 23, กรุงเทพฯ',
    },
  })

  // Create riders
  const rider1Password = await bcrypt.hash('rider123', 10)
  const rider1User = await prisma.user.upsert({
    where: { email: 'rider1@arifood.com' },
    update: {},
    create: {
      email: 'rider1@arifood.com',
      password: rider1Password,
      name: 'ไรเดอร์ สมชาย',
      role: UserRole.RIDER,
      phone: '0891234567',
      address: 'ลาดพร้าว, กรุงเทพฯ',
      latitude: 13.7878,
      longitude: 100.5692,
    },
  })

  const rider1 = await prisma.rider.upsert({
    where: { userId: rider1User.id },
    update: {},
    create: {
      userId: rider1User.id,
      licenseNumber: 'DL-12345678',
      vehicleType: VehicleType.MOTORCYCLE,
      vehiclePlate: 'กข-1234',
      bankAccount: '123-456-7890',
      bankName: 'ธนาคารกสิกรไทย',
      status: RiderStatus.APPROVED,
      isOnline: true,
      currentLatitude: 13.7878,
      currentLongitude: 100.5692,
      rating: 4.8,
      totalDeliveries: 156,
    },
  })

  const rider2Password = await bcrypt.hash('rider123', 10)
  const rider2User = await prisma.user.upsert({
    where: { email: 'rider2@arifood.com' },
    update: {},
    create: {
      email: 'rider2@arifood.com',
      password: rider2Password,
      name: 'ไรเดอร์ สมหญิง',
      role: UserRole.RIDER,
      phone: '0892345678',
      address: 'สาทร, กรุงเทพฯ',
      latitude: 13.7200,
      longitude: 100.5300,
    },
  })

  const rider2 = await prisma.rider.upsert({
    where: { userId: rider2User.id },
    update: {},
    create: {
      userId: rider2User.id,
      licenseNumber: 'DL-87654321',
      vehicleType: VehicleType.MOTORCYCLE,
      vehiclePlate: 'คง-5678',
      bankAccount: '987-654-3210',
      bankName: 'ธนาคารกรุงเทพ',
      status: RiderStatus.APPROVED,
      isOnline: false,
      currentLatitude: 13.7200,
      currentLongitude: 100.5300,
      rating: 4.5,
      totalDeliveries: 89,
    },
  })

  const rider3Password = await bcrypt.hash('rider123', 10)
  const rider3User = await prisma.user.upsert({
    where: { email: 'rider3@arifood.com' },
    update: {},
    create: {
      email: 'rider3@arifood.com',
      password: rider3Password,
      name: 'ไรเดอร์ สมศักดิ์',
      role: UserRole.RIDER,
      phone: '0893456789',
      address: 'บางนา, กรุงเทพฯ',
      latitude: 13.6670,
      longitude: 100.6050,
    },
  })

  const rider3 = await prisma.rider.upsert({
    where: { userId: rider3User.id },
    update: {},
    create: {
      userId: rider3User.id,
      licenseNumber: 'DL-11223344',
      vehicleType: VehicleType.BICYCLE,
      vehiclePlate: null,
      bankAccount: '555-666-7777',
      bankName: 'ธนาคารไทยพาณิชย์',
      status: RiderStatus.PENDING,  // รอการอนุมัติ
      isOnline: false,
      currentLatitude: 13.6670,
      currentLongitude: 100.6050,
      rating: 0,
      totalDeliveries: 0,
    },
  })

  // Create restaurants
  const restaurant1 = await prisma.restaurant.upsert({
    where: { slug: 'noodle-heaven' },
    update: {},
    create: {
      name: 'ก๋วยเตี๋ยวสวรรค์',
      slug: 'noodle-heaven',
      description: 'ก๋วยเตี๋ยวรสเด็ด เสิร์ฟร้อนๆ ครบรส ครบเครื่อง',
      address: 'ตลาดนัด JJ, กรุงเทพฯ',
      latitude: 13.7995,
      longitude: 100.5500,
      phone: '02-123-4567',
      email: 'noodleheaven@example.com',
      deliveryTime: '20-30 นาที',
      deliveryFee: 15,
      minimumOrder: 50,
      status: RestaurantStatus.APPROVED,
      rating: 4.5,
      ownerId: owner1.id,
    },
  })

  const restaurant2 = await prisma.restaurant.upsert({
    where: { slug: 'fried-rice-king' },
    update: {},
    create: {
      name: 'ข้าวผัดราชา',
      slug: 'fried-rice-king',
      description: 'ข้าวผัดหลากหลายรสชาติ อร่อยเข้มข้น ราคาย่อมเยา',
      address: 'ซอยสุขุมวิท 23, กรุงเทพฯ',
      latitude: 13.7310,
      longitude: 100.5690,
      phone: '02-234-5678',
      email: 'friedriceking@example.com',
      deliveryTime: '15-25 นาที',
      deliveryFee: 20,
      minimumOrder: 80,
      status: RestaurantStatus.APPROVED,
      rating: 4.2,
      ownerId: owner2.id,
    },
  })

  // Create categories
  const noodleCategory = await prisma.category.upsert({
    where: { slug: 'noodles' },
    update: {},
    create: {
      name: 'ก๋วยเตี๋ยว',
      slug: 'noodles',
      description: 'ก๋วยเตี๋ยวทุกชนิด น้ำใส น้ำข้น แห้ง',
      icon: '🍜',
    },
  })

  const riceCategory = await prisma.category.upsert({
    where: { slug: 'rice-dishes' },
    update: {},
    create: {
      name: 'ข้าว',
      slug: 'rice-dishes',
      description: 'ข้าวผัด ข้าวราดแกง ข้าวกับแกง',
      icon: '🍚',
    },
  })

  // Create products for restaurant 1
  const product1 = await prisma.product.upsert({
    where: { slug: 'tom-yum-noodle' },
    update: {},
    create: {
      name: 'ก๋วยเตี๋ยวต้มยำ',
      slug: 'tom-yum-noodle',
      description: 'ก๋วยเตี๋ยวต้มยำ รสเปรี้ยวๆ เผ็ดๆ หอมๆ',
      originalPrice: 60,
      price: 55,
      categoryId: noodleCategory.id,
      restaurantId: restaurant1.id,
      rating: 4.6,
    },
  })

  const product2 = await prisma.product.upsert({
    where: { slug: 'clear-soup-noodle' },
    update: {},
    create: {
      name: 'ก๋วยเตี๋ยวน้ำใส',
      slug: 'clear-soup-noodle',
      description: 'ก๋วยเตี๋ยวน้ำใส หมูนุ่ม น้ำซุปใส หวานมัน',
      originalPrice: 50,
      price: 45,
      categoryId: noodleCategory.id,
      restaurantId: restaurant1.id,
      rating: 4.4,
    },
  })

  // Create products for restaurant 2
  const product3 = await prisma.product.upsert({
    where: { slug: 'crab-fried-rice' },
    update: {},
    create: {
      name: 'ข้าวผัดปู',
      slug: 'crab-fried-rice',
      description: 'ข้าวผัดปูแท้ๆ เนื้อปูแน่น หอมๆ อร่อย',
      originalPrice: 120,
      price: 100,
      categoryId: riceCategory.id,
      restaurantId: restaurant2.id,
      rating: 4.7,
    },
  })

  const product4 = await prisma.product.upsert({
    where: { slug: 'chicken-fried-rice' },
    update: {},
    create: {
      name: 'ข้าวผัดไก่',
      slug: 'chicken-fried-rice',
      description: 'ข้าวผัดไก่ เนื้อไก่นุ่ม รสชาติกลมกล่อม',
      originalPrice: 70,
      price: 60,
      categoryId: riceCategory.id,
      restaurantId: restaurant2.id,
      rating: 4.3,
    },
  })

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-001',
      customerId: customer1.id,
      customerName: customer1.name,
      customerPhone: customer1.phone!,
      customerAddress: customer1.address!,
      customerLatitude: customer1.latitude,
      customerLongitude: customer1.longitude,
      riderId: rider1User.id,
      subtotalAmount: 100,
      deliveryFee: 15,
      totalAmount: 115,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PAID,
      restaurantId: restaurant1.id,
      orderItems: {
        create: [
          {
            productId: product1.id,
            quantity: 2,
            price: 55,
          },
        ],
      },
    },
  })

  const delivery1 = await prisma.delivery.create({
    data: {
      orderId: order1.id,
      riderId: rider1.id,
      pickupLatitude: restaurant1.latitude,
      pickupLongitude: restaurant1.longitude,
      deliveryLatitude: customer1.latitude,
      deliveryLongitude: customer1.longitude,
      status: 'DELIVERED',
      pickedUpAt: new Date(Date.now() - 60 * 60 * 1000), // 1 ชั่วโมงที่แล้ว
      deliveredAt: new Date(Date.now() - 30 * 60 * 1000), // 30 นาทีที่แล้ว
      estimatedDistance: 2.5,
      actualDistance: 2.8,
    },
  })

  // Create more sample orders
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-002',
      customerId: customer2.id,
      customerName: customer2.name,
      customerPhone: customer2.phone!,
      customerAddress: customer2.address!,
      customerLatitude: customer2.latitude,
      customerLongitude: customer2.longitude,
      riderId: rider2User.id,
      subtotalAmount: 160,
      deliveryFee: 20,
      totalAmount: 180,
      status: OrderStatus.OUT_FOR_DELIVERY,
      paymentMethod: PaymentMethod.MOBILE_BANKING,
      paymentStatus: PaymentStatus.PAID,
      restaurantId: restaurant2.id,
      orderItems: {
        create: [
          {
            productId: product3.id,
            quantity: 1,
            price: 100,
          },
          {
            productId: product4.id,
            quantity: 1,
            price: 60,
          },
        ],
      },
    },
  })

  const delivery2 = await prisma.delivery.create({
    data: {
      orderId: order2.id,
      riderId: rider2.id,
      pickupLatitude: restaurant2.latitude,
      pickupLongitude: restaurant2.longitude,
      deliveryLatitude: customer2.latitude,
      deliveryLongitude: customer2.longitude,
      status: 'GOING_TO_DELIVERY',
      pickedUpAt: new Date(Date.now() - 15 * 60 * 1000), // 15 นาทีที่แล้ว
      estimatedDistance: 3.2,
    },
  })

  // Create delivery tracking for order 2
  await prisma.deliveryTracking.createMany({
    data: [
      {
        deliveryId: delivery2.id,
        latitude: 13.7310,
        longitude: 100.5690,
        status: 'ASSIGNED',
      },
      {
        deliveryId: delivery2.id,
        latitude: 13.7310,
        longitude: 100.5690,
        status: 'ARRIVED_PICKUP',
      },
      {
        deliveryId: delivery2.id,
        latitude: 13.7310,
        longitude: 100.5690,
        status: 'PICKED_UP',
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log(`
🔑 Login Credentials:
👨‍💼 Admin: admin@arifood.com / admin123
👤 Customer 1: customer1@arifood.com / customer123
👤 Customer 2: customer2@arifood.com / customer123
🏪 Restaurant Owner 1: owner1@arifood.com / owner123
🏪 Restaurant Owner 2: owner2@arifood.com / owner123
🛵 Rider 1: rider1@arifood.com / rider123
🛵 Rider 2: rider2@arifood.com / rider123
🛵 Rider 3: rider3@arifood.com / rider123 (รอการอนุมัติ)

📊 Sample Data Created:
- 2 Restaurants (approved)
- 4 Products
- 2 Orders (1 delivered, 1 in delivery)
- 3 Riders (2 approved, 1 pending)
- 2 Customers
`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 