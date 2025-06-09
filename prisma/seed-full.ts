import { PrismaClient } from '../src/generated/prisma'
import { createSlug } from '../src/lib/slug'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting full database seed...')

  // ลบข้อมูลเก่าก่อน
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.restaurant.deleteMany()

  console.log('🗑️ Cleaned existing data')

  // สร้าง categories ภาษาไทยและภาษาอังกฤษ
  const categories = [
    {
      name: 'อาหารไทย',
      description: 'อาหารไทยต้นตำรับ รสชาติดั้งเดิม',
      icon: '🇹🇭',
    },
    {
      name: 'ก๋วยเตี๋ยว',
      description: 'ก๋วยเตี๋ยวหลากหลายรูปแบบ',
      icon: '🍜',
    },
    {
      name: 'อาหารริมทาง',
      description: 'อาหารริมทางสไตล์ไทย',
      icon: '🛒',
    },
    {
      name: 'เครื่องดื่ม',
      description: 'เครื่องดื่มหลากหลาย',
      icon: '🧋',
    },
    {
      name: 'ขนมหวาน',
      description: 'ขนมหวานไทยและสากล',
      icon: '🍰',
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const slug = createSlug(category.name);
    console.log(`📁 Creating category: ${category.name} -> ${slug}`);
    
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug,
        description: category.description,
        icon: category.icon,
      },
    });
    createdCategories.push(created);
  }

  // สร้าง restaurants
  const restaurants = [
    {
      name: 'ครัวคุณยาย',
      description: 'ร้านอาหารไทยต้นตำรับ',
      address: '123 ถนนสุขุมวิท กรุงเทพฯ',
      phone: '02-123-4567',
      rating: 4.8,
      deliveryTime: '15-25 นาที',
    },
    {
      name: 'บ้านก๋วยเตี๋ยว',
      description: 'ก๋วยเตี๋ยวสดใหม่ทุกวัน',
      address: '456 ถนนพหลโยธิน กรุงเทพฯ',
      phone: '02-234-5678',
      rating: 4.5,
      deliveryTime: '10-20 นาที',
    },
  ];

  const createdRestaurants = [];
  for (const restaurant of restaurants) {
    const slug = createSlug(restaurant.name);
    console.log(`🏪 Creating restaurant: ${restaurant.name} -> ${slug}`);
    
    const created = await prisma.restaurant.create({
      data: {
        ...restaurant,
        slug,
      },
    });
    createdRestaurants.push(created);
  }

  // สร้าง products
  const products = [
    // อาหารไทย
    {
      name: 'ผัดไทยกุ้งสด',
      description: 'ผัดไทยใส่กุ้งสดๆ หอมหวานเปรี้ยว พร้อมถั่วงอก หัวไชโป๊ว',
      originalPrice: 100.00,
      price: 80.00,
      categoryIndex: 0, // อาหารไทย
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1559847844-d9173c821bf8?w=400',
    },
    {
      name: 'ต้มยำกุ้งน้ำข้น',
      description: 'ต้มยำกุ้งรสเข้มข้น เผ็ดร้อนตามแบบไทยแท้ ใส่เห็ดฟาง',
      originalPrice: 150.00,
      price: 120.00,
      categoryIndex: 0, // อาหารไทย
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400',
    },
    {
      name: 'แกงเขียวหวานไก่',
      description: 'แกงเขียวหวานไก่ กะทิหอมหวาน พร้อมผักสด',
      originalPrice: 110.00,
      price: 90.00,
      categoryIndex: 0, // อาหารไทย
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
    },
    
    // ก๋วยเตี๋ยว
    {
      name: 'ก๋วยเตี๋ยวเรือต้มยำ',
      description: 'ก๋วยเตี๋ยวเรือต้มยำ รสจัดจ้าน เนื้อหมูและลูกชิ้น',
      originalPrice: 55.00,
      price: 45.00,
      categoryIndex: 1, // ก๋วยเตี๋ยว
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400',
    },
    {
      name: 'ก๋วยเตี๋ยวหมูแดง',
      description: 'ก๋วยเตี๋ยวหมูแดง น้ำใส หวานมัน พร้อมผักกาด',
      originalPrice: 50.00,
      price: 40.00,
      categoryIndex: 1, // ก๋วยเตี๋ยว
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    },
    {
      name: 'ผัดซีอิ๊วหมู',
      description: 'ก๋วยเตี๋ยวผัดซีอิ๊วหมู ใส่ผักคะน้า หอมหวาน',
      originalPrice: 60.00,
      price: 50.00,
      categoryIndex: 1, // ก๋วยเตี๋ยว
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    },
    
    // อาหารริมทาง
    {
      name: 'ข้าวมันไก่',
      description: 'ข้าวมันไก่ต้มนุ่ม เสิร์ฟพร้อมซอสและน้ำจิ้ม',
      originalPrice: 45.00,
      price: 35.00,
      categoryIndex: 2, // อาหารริมทาง
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    },
    {
      name: 'ส้มตำไทย',
      description: 'ส้มตำไทยใส่ปลาร้า เผ็ดตามใจ พร้อมผักสด',
      originalPrice: 40.00,
      price: 30.00,
      categoryIndex: 2, // อาหารริมทาง
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1559847844-d9173c821bf8?w=400',
    },
    {
      name: 'ไก่ย่างหอมควัน',
      description: 'ไก่ย่างหอมควัน เสิร์ฟพร้อมน้ำจิ้มแจ่วบอง',
      originalPrice: 30.00,
      price: 25.00,
      categoryIndex: 2, // อาหารริมทาง
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    },
    
    // เครื่องดื่ม (ไม่มีส่วนลด)
    {
      name: 'ชาไทยเย็น',
      description: 'ชาไทยเย็นหวานมัน ใส่นมข้นหวาน',
      price: 20.00,
      categoryIndex: 3, // เครื่องดื่ม
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
    },
    {
      name: 'กาแฟโบราณ',
      description: 'กาแฟโบราณหอมกรุ่น ชงสดใหม่',
      price: 25.00,
      categoryIndex: 3, // เครื่องดื่ม
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    },
    
    // ขนมหวาน (ไม่มีส่วนลด)
    {
      name: 'ขนมครกขาว',
      description: 'ขนมครกขาวหวานมัน โรยหน้าด้วยมะพร้าวขาว',
      price: 15.00,
      categoryIndex: 4, // ขนมหวาน
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
    },
    {
      name: 'ทองหยิบ',
      description: 'ทองหยิบสีทองสวยงาม หวานหอม',
      price: 12.00,
      categoryIndex: 4, // ขนมหวาน
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    },
  ];

  for (const product of products) {
    const slug = createSlug(product.name);
    console.log(`🍽️ Creating product: ${product.name} -> ${slug}`);
    
    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description: product.description,
        originalPrice: product.originalPrice,
        price: product.price,
        categoryId: createdCategories[product.categoryIndex].id,
        rating: product.rating,
        image: product.image,
      },
    });
  }

  console.log('✅ Full database seed completed successfully!')
  console.log('\n🔗 Test URLs:')
  console.log(`- /categories/${encodeURIComponent(createSlug('อาหารไทย'))}`)
  console.log(`- /products/${encodeURIComponent(createSlug('ผัดไทยกุ้งสด'))}`)
  console.log(`- /products/${encodeURIComponent(createSlug('ต้มยำกุ้งน้ำข้น'))}`)
  console.log(`- /categories/${encodeURIComponent(createSlug('ก๋วยเตี๋ยว'))}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 