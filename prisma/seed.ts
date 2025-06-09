import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // ลบข้อมูลเก่าก่อน
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.restaurant.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  // สร้าง categories
  const healthyFood = await prisma.category.create({
    data: {
      name: 'Healthy Food',
      slug: 'healthy-food',
      description: 'อาหารเพื่อสุขภาพ',
      icon: '🥗',
    },
  })

  const fruits = await prisma.category.create({
    data: {
      name: 'Fruits',
      slug: 'fruits',
      description: 'ผลไม้สด',
      icon: '🍎',
    },
  })

  const desserts = await prisma.category.create({
    data: {
      name: 'Desserts',
      slug: 'desserts',
      description: 'ของหวาน',
      icon: '🍰',
    },
  })

  const drinks = await prisma.category.create({
    data: {
      name: 'Drinks',
      slug: 'drinks',
      description: 'เครื่องดื่ม',
      icon: '🥤',
    },
  })

  // สร้าง users และ restaurants
  const hashedPassword = await bcrypt.hash('123456', 10)

  const healthyKitchenOwner = await prisma.user.create({
    data: {
      email: 'healthy@kitchen.com',
      password: hashedPassword,
      name: 'คุณสุขภาพ ดี',
      role: 'RESTAURANT_OWNER',
      restaurant: {
        create: {
          name: 'Healthy Kitchen',
          slug: 'healthy-kitchen',
          description: 'ร้านอาหารเพื่อสุขภาพ',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ',
          phone: '02-123-4567',
          rating: 4.5,
          deliveryTime: '15-25 นาที',
        }
      }
    },
    include: {
      restaurant: true
    }
  })

  const pastaHouseOwner = await prisma.user.create({
    data: {
      email: 'pasta@house.com',
      password: hashedPassword,
      name: 'คุณพาสต้า เฮาส์',
      role: 'RESTAURANT_OWNER',
      restaurant: {
        create: {
          name: 'Pasta House',
          slug: 'pasta-house',
          description: 'ร้านพาสต้า',
          address: '456 ถนนพหลโยธิน กรุงเทพฯ',
          phone: '02-234-5678',
          rating: 4.7,
          deliveryTime: '20-30 นาที',
        }
      }
    },
    include: {
      restaurant: true
    }
  })

  // สร้าง products
  const healthyProducts = [
    {
      name: 'Grilled Chicken Salad',
      slug: 'grilled-chicken-salad',
      description: 'สลัดไก่ย่างสดใส พร้อมผักสีเขียว',
      price: 120.00,
      categoryId: healthyFood.id,
      restaurantId: healthyKitchenOwner.restaurant!.id,
      rating: 4.5,
    },
    {
      name: 'Quinoa Bowl',
      slug: 'quinoa-bowl',
      description: 'ควินัวโบลล์ พร้อมผักและเนื้อไก่',
      price: 150.00,
      categoryId: healthyFood.id,
      restaurantId: healthyKitchenOwner.restaurant!.id,
      rating: 4.3,
    },
    {
      name: 'Mixed Berry Smoothie',
      slug: 'mixed-berry-smoothie',
      description: 'สมูทตี้เบอร์รี่รวม',
      price: 89.00,
      categoryId: fruits.id,
      restaurantId: healthyKitchenOwner.restaurant!.id,
      rating: 4.6,
    },
    {
      name: 'Dragon Fruit Salad',
      slug: 'dragon-fruit-salad',
      description: 'สลัดแก้วมังกร',
      price: 65.00,
      categoryId: fruits.id,
      restaurantId: healthyKitchenOwner.restaurant!.id,
      rating: 4.2,
    },
  ]

  const pastaProducts = [
    {
      name: 'Chocolate Cake',
      slug: 'chocolate-cake',
      description: 'เค้กช็อกโกแลตเข้มข้น',
      price: 95.00,
      categoryId: desserts.id,
      restaurantId: pastaHouseOwner.restaurant!.id,
      rating: 4.8,
    },
    {
      name: 'Tiramisu',
      slug: 'tiramisu',
      description: 'ทีรามิสุแสนอร่อย',
      price: 110.00,
      categoryId: desserts.id,
      restaurantId: pastaHouseOwner.restaurant!.id,
      rating: 4.7,
    },
    {
      name: 'Fresh Orange Juice',
      slug: 'fresh-orange-juice',
      description: 'น้ำส้มคั้นสด 100%',
      price: 45.00,
      categoryId: drinks.id,
      restaurantId: pastaHouseOwner.restaurant!.id,
      rating: 4.4,
    },
    {
      name: 'Green Tea Latte',
      slug: 'green-tea-latte',
      description: 'ชาเขียวลาเต้หอมกรุ่น',
      price: 55.00,
      categoryId: drinks.id,
      restaurantId: pastaHouseOwner.restaurant!.id,
      rating: 4.5,
    },
  ]

  for (const product of [...healthyProducts, ...pastaProducts]) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 