import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function manageAddOns() {
  console.log('🔧 จัดการ Add-ons สำหรับสินค้า')

  try {
    // ลบ add-ons ออกจากเครื่องดื่มทั้งหมด
    const drinkCategory = await prisma.category.findFirst({
      where: { name: 'เครื่องดื่ม' }
    })

    if (drinkCategory) {
      const drinkProducts = await prisma.product.findMany({
        where: { categoryId: drinkCategory.id }
      })

      for (const product of drinkProducts) {
        await prisma.productAddOn.deleteMany({
          where: { productId: product.id }
        })
        console.log(`❌ ลบ add-ons ออกจาก "${product.name}"`)
      }
    }

    // ลบ add-ons ออกจากขนมหวานบางตัว
    const dessertCategory = await prisma.category.findFirst({
      where: { name: 'ขนมหวาน' }
    })

    if (dessertCategory) {
      const dessertProducts = await prisma.product.findMany({
        where: { categoryId: dessertCategory.id }
      })

      for (const product of dessertProducts) {
        // ลบ add-ons ออกจากขนมหวานทั้งหมด (เพราะไม่เหมาะสม)
        await prisma.productAddOn.deleteMany({
          where: { productId: product.id }
        })
        console.log(`❌ ลบ add-ons ออกจาก "${product.name}"`)
      }
    }

    // เพิ่ม add-ons ให้กับสินค้าที่เหมาะสม
    const products = await prisma.product.findMany({
      include: {
        category: true,
        addOns: true
      }
    })

    console.log('\n📊 สรุปสินค้าและ Add-ons:')
    for (const product of products) {
      console.log(`\n📦 ${product.name} (${product.category?.name})`)
      if (product.addOns.length > 0) {
        console.log(`   ✅ มี ${product.addOns.length} add-ons`)
      } else {
        console.log(`   ❌ ไม่มี add-ons`)
      }
    }

    console.log('\n🎉 จัดการ Add-ons เสร็จสิ้น!')

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error)
  } finally {
    await prisma.$disconnect()
  }
}

manageAddOns() 