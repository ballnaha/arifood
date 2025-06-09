import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // สร้าง add-ons ทั่วไป
  const addOns = [
    { name: 'ไข่ดาว', price: 10 },
    { name: 'ไข่เจียว', price: 15 },
    { name: 'แฮม', price: 20 },
    { name: 'เบคอน', price: 25 },
    { name: 'ชีส', price: 15 },
    { name: 'เห็ด', price: 12 },
    { name: 'ไส้กรอก', price: 18 },
    { name: 'หมูยอ', price: 22 },
    { name: 'ข้าวเพิ่ม', price: 8 },
    { name: 'ผักเพิ่ม', price: 5 },
  ]

  // สร้าง add-ons ทีละตัว
  const createdAddOns = []
  for (const addOn of addOns) {
    // ลองหาก่อนว่ามีหรือยัง
    let created = await prisma.addOn.findFirst({
      where: { name: addOn.name }
    })
    
    if (!created) {
      created = await prisma.addOn.create({
        data: addOn
      })
    }
    
    createdAddOns.push(created)
    console.log(`✅ Add-on: ${created.name} (฿${created.price})`)
  }

  // หา products ที่มีอยู่
  const products = await prisma.product.findMany()
  
  if (products.length === 0) {
    console.log('⚠️ ไม่พบ products ใน database กรุณา seed products ก่อน')
    return
  }

  // กำหนด add-ons สำหรับแต่ละประเภทอาหาร
  const addOnMappings = [
    {
      categoryNames: ['อาหารคาว', 'กิมจิ', 'อาหารไทย'],
      addOnNames: ['ไข่ดาว', 'ไข่เจียว', 'แฮม', 'เบคอน', 'ข้าวเพิ่ม', 'ผักเพิ่ม']
    },
    {
      categoryNames: ['ก๋วยเตี๋ยว'],
      addOnNames: ['ไข่ดาว', 'หมูยอ', 'ไส้กรอก', 'เห็ด', 'ผักเพิ่ม']
    },
    {
      categoryNames: ['ขนมหวาน'],
      addOnNames: ['ชีส', 'เห็ด'] // สำหรับขนมที่เป็นแบบคาว
    },
    {
      categoryNames: ['เครื่องดื่ม'],
      addOnNames: [] // เครื่องดื่มไม่ค่อยมี add-ons
    }
  ]

  // เชื่อมต่อ products กับ add-ons
  for (const product of products) {
    const categoryName = await prisma.category.findUnique({
      where: { id: product.categoryId },
      select: { name: true }
    })

    if (!categoryName) continue

    // หา add-ons ที่เหมาะสมสำหรับ category นี้
    const mapping = addOnMappings.find(m => 
      m.categoryNames.includes(categoryName.name)
    )

    if (!mapping || mapping.addOnNames.length === 0) continue

    // เชื่อมต่อ product กับ add-ons
    for (const addOnName of mapping.addOnNames) {
      const addOn = createdAddOns.find(a => a.name === addOnName)
      if (!addOn) continue

      await prisma.productAddOn.upsert({
        where: {
          productId_addOnId: {
            productId: product.id,
            addOnId: addOn.id
          }
        },
        update: {},
        create: {
          productId: product.id,
          addOnId: addOn.id,
          isActive: true
        }
      })
    }

    console.log(`🔗 เชื่อมต่อ "${product.name}" กับ add-ons สำเร็จ`)
  }

  console.log('\n🎉 Seed add-ons เสร็จสิ้น!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 