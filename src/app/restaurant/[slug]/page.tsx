'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useRestaurantDialog } from '@/context/RestaurantDialogContext'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Restaurant {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  email?: string
  image?: string
  rating: number
  deliveryTime?: string
  owner: {
    name: string
    email: string
  }
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  rating: number
  category: {
    id: string
    name: string
  }
  restaurant: {
    name: string
    slug: string
  }
}

export default function RestaurantPage() {
  const params = useParams()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem, getItemQuantity } = useCartStore()
  const { showDialog } = useRestaurantDialog()
  const { requireAuth } = useRequireAuth()

  useEffect(() => {
    if (params.slug) {
      fetchRestaurantData(params.slug as string)
    }
  }, [params.slug])

  const fetchRestaurantData = async (slug: string) => {
    try {
      // ดึงข้อมูลร้านค้าทั้งหมดแล้วหาจาก slug
      const restaurantsRes = await fetch('/api/restaurants')
      const restaurantsData = await restaurantsRes.json()
      
      const foundRestaurant = restaurantsData.find((r: Restaurant) => r.slug === slug)
      
      if (!foundRestaurant) {
        router.push('/restaurant')
        return
      }

      setRestaurant(foundRestaurant)

      // ดึงข้อมูลอาหารของร้านนี้
      const productsRes = await fetch(`/api/restaurants/${foundRestaurant.id}/products`)
      const productsData = await productsRes.json()
      setProducts(productsData)
      
    } catch (error) {
      console.error('Error fetching restaurant data:', error)
      router.push('/restaurant')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: Product) => {
    // ตรวจสอบการ login ก่อนเพิ่มลงตะกร้า
    requireAuth(async () => {
      const restaurantInfo = {
        id: restaurant!.id,
        name: restaurant!.name,
        slug: restaurant!.slug
      };

      const handleRestaurantConflict = (currentRestaurant: string, newRestaurant: string): Promise<boolean> => {
        return new Promise((resolve) => {
          showDialog({
            currentRestaurant,
            newRestaurant,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          });
        });
      };

      const success = await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryName: product.category.name,
        restaurantId: restaurant!.id,
        restaurantName: restaurant!.name,
      }, restaurantInfo, handleRestaurantConflict);

      if (!success) {
        console.log('การเพิ่มสินค้าถูกยกเลิก');
      }
    });
  }

  if (loading) {
    return <LoadingSpinner fullScreen={true} />
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ไม่พบร้านค้า
          </h3>
          <p className="text-gray-600 mb-4">
            ร้านค้าที่คุณค้นหาไม่มีอยู่ในระบบ
          </p>
          <button
            onClick={() => router.push('/restaurant')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            กลับไปหน้าร้านค้า
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Restaurant Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 mb-2">
                โดย {restaurant.owner.name}
              </p>
              {restaurant.description && (
                <p className="text-gray-700 mb-4">
                  {restaurant.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                ⭐ {restaurant.rating.toFixed(1)}
              </span>
              {restaurant.deliveryTime && (
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  🕒 {restaurant.deliveryTime}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {restaurant.address && (
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                {restaurant.address}
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                {restaurant.phone}
              </div>
            )}
            {restaurant.email && (
              <div className="flex items-center">
                <span className="mr-2">📧</span>
                {restaurant.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          เมนูอาหาร ({products.length} รายการ)
        </h2>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ยังไม่มีเมนูอาหาร
          </h3>
          <p className="text-gray-600">
            ร้านนี้ยังไม่ได้เพิ่มเมนูอาหาร
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const quantity = getItemQuantity(product.id)
            
            return (
              <div 
                key={product.id} 
                onClick={() => router.push(`/restaurant/${restaurant.slug}/product/${product.slug}`)}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      ลด {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.category.name}
                  </p>
                  {product.description && (
                    <p className="text-sm text-gray-500 mb-3">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ฿{product.originalPrice}
                        </span>
                      )}
                      <span className="text-lg font-bold text-yellow-600">
                        ฿{product.price}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-1">⭐</span>
                      {product.rating.toFixed(1)}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/restaurant/${restaurant.slug}/product/${product.slug}`);
                    }}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    {quantity > 0 ? (
                      <span>ดูรายละเอียด ({quantity} ในตะกร้า)</span>
                    ) : (
                      <span>ดูรายละเอียด</span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/restaurant')}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          ← กลับไปหน้าร้านค้า
        </button>
      </div>
    </div>
  )
} 