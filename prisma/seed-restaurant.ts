import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding restaurant data...')

  // สร้าง User และ Restaurant
  const hashedPassword = await bcrypt.hash('123456', 10)

  // ร้านอาหารไทย
  const thaiRestaurantOwner = await prisma.user.create({
    data: {
      email: 'thai@restaurant.com',
      password: hashedPassword,
      name: 'คุณสมชาย ใจดี',
      role: 'RESTAURANT_OWNER',
      restaurant: {
        create: {
          name: 'ร้านอาหารไทยแท้',
          slug: 'thai-authentic-restaurant',
          description: 'อาหารไทยต้นตำรับ รสชาติเข้มข้น ถูกปากคนไทย',
          address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'thai@restaurant.com',
          deliveryTime: '20-30 นาที'
        }
      }
    },
    include: {
      restaurant: true
    }
  })

  // ร้านอาหารญี่ปุ่น
  const japaneseRestaurantOwner = await prisma.user.create({
    data: {
      email: 'japanese@restaurant.com',
      password: hashedPassword,
      name: 'คุณยูกิ ซาโต',
      role: 'RESTAURANT_OWNER',
      restaurant: {
        create: {
          name: 'ซูชิ ฮานะ',
          slug: 'sushi-hana',
          description: 'ซูชิสดใหม่ นำเข้าจากญี่ปุ่น คุณภาพระดับพรีเมียม',
          address: '456 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
          phone: '02-234-5678',
          email: 'japanese@restaurant.com',
          deliveryTime: '25-35 นาที',
          isOpen: false  // ร้านนี้ปิด
        }
      }
    },
    include: {
      restaurant: true
    }
  })

  // ร้านพิซซ่า
  const pizzaRestaurantOwner = await prisma.user.create({
    data: {
      email: 'pizza@restaurant.com',
      password: hashedPassword,
      name: 'คุณมาริโอ รอสซี',
      role: 'RESTAURANT_OWNER',
      restaurant: {
        create: {
          name: 'มาริโอ พิซซ่า',
          slug: 'mario-pizza',
          description: 'พิซซ่าสไตล์อิตาเลียน เตาอบไฟฟ้า หน้าเต็ม ชีสเยิ้ม',
          address: '789 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
          phone: '02-345-6789',
          email: 'pizza@restaurant.com',
          deliveryTime: '15-25 นาที'
        }
      }
    },
    include: {
      restaurant: true
    }
  })

  // ดึงหมวดหมู่ที่มีอยู่
  const categories = await prisma.category.findMany()
  const healthyFoodCategory = categories.find(c => c.name === 'Healthy Food')
  const drinkCategory = categories.find(c => c.name === 'Drinks')

  if (!healthyFoodCategory || !drinkCategory) {
    throw new Error('ไม่พบหมวดหมู่ที่จำเป็น กรุณารัน seed categories ก่อน')
  }

  // เพิ่มอาหารสำหรับร้านอาหารไทย
  if (thaiRestaurantOwner.restaurant) {
    await prisma.product.createMany({
      data: [
        {
          name: 'ผัดไทยกุ้งสด',
          slug: 'pad-thai-shrimp',
          description: 'ผัดไทยกุ้งสด รสชาติหวานเปรียว เส้นเหนียวนุ่ม',
          price: 120,
          originalPrice: 150,
          categoryId: healthyFoodCategory.id,
          restaurantId: thaiRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400'
        },
        {
          name: 'ต้มยำกุ้งน้ำข้น',
          slug: 'tom-yum-goong',
          description: 'ต้มยำกุ้งน้ำข้น รสเปรี้ยวเผ็ด กุ้งสดใหญ่',
          price: 180,
          categoryId: healthyFoodCategory.id,
          restaurantId: thaiRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400'
        },
        {
          name: 'แกงเขียวหวานไก่',
          slug: 'green-curry-chicken',
          description: 'แกงเขียวหวานไก่ เผ็ดหอม กะทิเข้มข้น',
          price: 140,
          categoryId: healthyFoodCategory.id,
          restaurantId: thaiRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400'
        },
        {
          name: 'ชาไทยเย็น',
          slug: 'thai-iced-tea',
          description: 'ชาไทยเย็น หวานมัน เข้มข้น',
          price: 45,
          categoryId: drinkCategory.id,
          restaurantId: thaiRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400'
        }
      ]
    })
  }

  // เพิ่มอาหารสำหรับร้านอาหารญี่ปุ่น
  if (japaneseRestaurantOwner.restaurant) {
    await prisma.product.createMany({
      data: [
        {
          name: 'ซูชิแซลมอนพรีเมียม',
          slug: 'premium-salmon-sushi',
          description: 'ซูชิแซลมอนสดใหม่ นำเข้าจากนอร์เวย์',
          price: 280,
          originalPrice: 320,
          categoryId: healthyFoodCategory.id,
          restaurantId: japaneseRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'
        },
        {
          name: 'ราเมนหมูชาชู',
          slug: 'chashu-ramen',
          description: 'ราเมนน้ำใส หมูชาชูนุ่ม ไข่ออนเซ็น',
          price: 220,
          categoryId: healthyFoodCategory.id,
          restaurantId: japaneseRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
        },
        {
          name: 'เทมปุระกุ้ง',
          slug: 'shrimp-tempura',
          description: 'เทมปุระกุ้งใหญ่ แป้งกรอบ เสิร์ฟพร้อมซอส',
          price: 180,
          categoryId: healthyFoodCategory.id,
          restaurantId: japaneseRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400'
        },
        {
          name: 'ชาเขียวร้อน',
          slug: 'hot-green-tea',
          description: 'ชาเขียวญี่ปุ่นแท้ หอมกรุ่น',
          price: 60,
          categoryId: drinkCategory.id,
          restaurantId: japaneseRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1564890273409-d5df9b2b2d3b?w=400'
        }
      ]
    })
  }

  // เพิ่มอาหารสำหรับร้านพิซซ่า
  if (pizzaRestaurantOwner.restaurant) {
    await prisma.product.createMany({
      data: [
        {
          name: 'พิซซ่ามาร์เกอริต้า',
          slug: 'margherita-pizza',
          description: 'พิซซ่าคลาสสิก มอสซาเรลล่า มะเขือเทศ โหระพา',
          price: 250,
          categoryId: healthyFoodCategory.id,
          restaurantId: pizzaRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'
        },
        {
          name: 'พิซซ่าเปปเปอโรนี่',
          slug: 'pepperoni-pizza',
          description: 'พิซซ่าเปปเปอโรนี่ ชีสเยิ้ม รสเผ็ดนิดๆ',
          price: 280,
          originalPrice: 320,
          categoryId: healthyFoodCategory.id,
          restaurantId: pizzaRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'
        },
        {
          name: 'พิซซ่าซีฟู้ด',
          slug: 'seafood-pizza',
          description: 'พิซซ่าซีฟู้ด กุ้ง หมึก หอยเชลล์ ชีสเต็ม',
          price: 320,
          categoryId: healthyFoodCategory.id,
          restaurantId: pizzaRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
        },
        {
          name: 'โค้กเย็น',
          slug: 'iced-coke',
          description: 'โค้กเย็นสดชื่น',
          price: 35,
          categoryId: drinkCategory.id,
          restaurantId: pizzaRestaurantOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400'
        }
      ]
    })
  }

  // เพิ่มร้านค้าเพิ่มเติม
  const cafeOwner = await prisma.user.create({
    data: {
      email: 'cafe@restaurant.com',
      password: hashedPassword,
      name: 'คุณอรุณ คาเฟ่',
      role: 'RESTAURANT_OWNER',
      restaurant: {
        create: {
          name: 'Arun Coffee & Bakery',
          slug: 'arun-coffee-bakery',
          description: 'คาเฟ่อบอุ่น กาแฟหอม เบเกอรี่สดใหม่ทุกวัน',
          address: '321 ถนนพระราม 4 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',
          phone: '02-456-7890',
          email: 'cafe@restaurant.com',
          deliveryTime: '10-20 นาที',
          isOpen: true
        }
      }
    },
    include: {
      restaurant: true
    }
  })

  // เพิ่มร้านบุฟเฟ่ต์
  const buffetOwner = await prisma.user.create({
    data: {
      email: 'buffet@restaurant.com',
      password: hashedPassword,
      name: 'คุณสมชาย บุฟเฟ่ต์',
      role: 'RESTAURANT_OWNER',
      restaurant: {
        create: {
          name: 'King Buffet',
          slug: 'king-buffet',
          description: 'บุฟเฟ่ต์ปิ้งย่าง ชาบู อาหารนานาชาติ มากกว่า 200 เมนู',
          address: '654 ถนนงามวงศ์วาน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
          phone: '02-567-8901',
          email: 'buffet@restaurant.com',
          deliveryTime: '45-60 นาที',
          isOpen: false  // ร้านนี้ปิด
        }
      }
    },
    include: {
      restaurant: true
    }
  })

  // เพิ่มอาหารสำหรับคาเฟ่
  if (cafeOwner.restaurant) {
    await prisma.product.createMany({
      data: [
        {
          name: 'ลาเต้หอม',
          slug: 'aromatic-latte',
          description: 'ลาเต้หอมกรุ่น ใช้เมล็ดกาแฟคัดพิเศษ',
          price: 85,
          categoryId: drinkCategory.id,
          restaurantId: cafeOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400'
        },
        {
          name: 'แซนวิชทูน่า',
          slug: 'tuna-sandwich',
          description: 'แซนวิชทูน่า เบรดสดนุ่ม ไส้แน่น',
          price: 120,
          categoryId: healthyFoodCategory.id,
          restaurantId: cafeOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763ed1?w=400'
        },
        {
          name: 'ครัวซองต์เนย',
          slug: 'butter-croissant',
          description: 'ครัวซองต์เนย กรอบนอกนุ่มใน อบใหม่ทุกเช้า',
          price: 65,
          categoryId: healthyFoodCategory.id,
          restaurantId: cafeOwner.restaurant.id,
          image: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=400'
        }
      ]
    })
  }

  // สร้าง Customer user ตัวอย่าง
  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: hashedPassword,
      name: 'คุณลูกค้า ทดสอบ',
      role: 'CUSTOMER'
    }
  })

  console.log('✅ Restaurant data seeded successfully!')
  console.log('📧 Test accounts:')
  console.log('   - thai@restaurant.com (ร้านอาหารไทย)')
  console.log('   - japanese@restaurant.com (ร้านอาหารญี่ปุ่น)')
  console.log('   - pizza@restaurant.com (ร้านพิซซ่า)')
  console.log('   - customer@example.com (ลูกค้า)')
  console.log('🔑 Password for all accounts: 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
