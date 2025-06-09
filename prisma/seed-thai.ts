import { PrismaClient } from '../src/generated/prisma'
import { createSlug } from '../src/lib/slug'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting Thai language seed...')

  // สร้าง categories ภาษาไทย
  const thaiFood = await prisma.category.create({
    data: {
      name: 'อาหารไทย',
      slug: createSlug('อาหารไทย'),
      description: 'อาหารไทยต้นตำรับ รสชาติดั้งเดิม',
      icon: '🇹🇭',
    },
  })

  const noodles = await prisma.category.create({
    data: {
      name: 'ก๋วยเตี๋ยว',
      slug: createSlug('ก๋วยเตี๋ยว'),
      description: 'ก๋วยเตี๋ยวหลากหลายรูปแบบ',
      icon: '🍜',
    },
  })

  // สร้าง products ภาษาไทย
  const thaiProducts = [
    {
      name: 'ผัดไทยกุ้งสด',
      description: 'ผัดไทยใส่กุ้งสดๆ หอมหวานเปรี้ยว',
      price: 80.00,
      categoryId: thaiFood.id,
      rating: 4.8,
    },
    {
      name: 'ต้มยำกุ้งน้ำข้น',
      description: 'ต้มยำกุ้งรสเข้มข้น เผ็ดร้อนตามแบบไทยแท้',
      price: 120.00,
      categoryId: thaiFood.id,
      rating: 4.9,
    },
    {
      name: 'ก๋วยเตี๋ยวเรือต้มยำ',
      description: 'ก๋วยเตี๋ยวเรือต้มยำ รสจัดจ้าน',
      price: 45.00,
      categoryId: noodles.id,
      rating: 4.5,
    },
  ]

  for (const product of thaiProducts) {
    const slug = createSlug(product.name);
    console.log(`Creating product: ${product.name} -> slug: ${slug}`);
    
    await prisma.product.create({
      data: {
        ...product,
        slug,
      },
    })
  }

  console.log('Thai language seed completed successfully!')
  console.log('Test URLs:')
  console.log(`- /categories/${createSlug('อาหารไทย')}`)
  console.log(`- /products/${createSlug('ผัดไทยกุ้งสด')}`)
  console.log(`- /products/${createSlug('ต้มยำกุ้งน้ำข้น')}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 