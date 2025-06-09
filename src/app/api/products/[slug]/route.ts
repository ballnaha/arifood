import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decodeSlug } from '@/lib/slug'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: encodedSlug } = await params;
    const slug = decodeSlug(encodedSlug);
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        addOns: {
          where: {
            isActive: true,
          },
          include: {
            addOn: {
              select: {
                id: true,
                name: true,
                price: true,
                isActive: true,
              },
            },
          },
        },
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
} 