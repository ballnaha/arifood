import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  categoryName: string
  instructions?: string
  extras?: string
  restaurantId?: string
  restaurantName?: string
}

interface Restaurant {
  id: string
  name: string
  slug: string
}

interface CartStore {
  items: CartItem[]
  restaurant: Restaurant | null
  totalItems: number
  totalPrice: number
  _hasHydrated: boolean
  addItem: (
    item: Omit<CartItem, 'quantity'>, 
    restaurant?: Restaurant,
    onRestaurantConflict?: (currentRestaurant: string, newRestaurant: string) => Promise<boolean>
  ) => Promise<boolean>
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (id: string) => number
  setHasHydrated: (state: boolean) => void
  canAddFromRestaurant: (restaurantId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurant: null,
      totalItems: 0,
      totalPrice: 0,
      _hasHydrated: false,

      addItem: async (newItem, restaurant, onRestaurantConflict) => {
        const currentRestaurant = get().restaurant
        const items = get().items

        // ตรวจสอบว่าสามารถเพิ่มจากร้านนี้ได้หรือไม่
        if (newItem.restaurantId && currentRestaurant && currentRestaurant.id !== newItem.restaurantId) {
          // ถ้ามี callback ให้ใช้ dialog
          if (onRestaurantConflict) {
            const userConfirmed = await onRestaurantConflict(
              currentRestaurant.name,
              restaurant?.name || 'ร้านใหม่'
            )
            
            if (!userConfirmed) {
              return false
            }
          } else {
            // fallback ใช้ confirm ธรรมดา
            const userConfirmed = confirm(
              `คุณมีอาหารจากร้าน "${currentRestaurant.name}" อยู่ในตะกร้าแล้ว\n` +
              `ต้องการล้างตะกร้าและเริ่มสั่งจากร้าน "${restaurant?.name || 'ร้านใหม่'}" แทนหรือไม่?`
            )
            
            if (!userConfirmed) {
              return false
            }
          }
          
          // ล้างตะกร้าและเปลี่ยนร้าน
          set({ 
            items: [], 
            restaurant: restaurant || null,
            totalItems: 0,
            totalPrice: 0
          })
        } else if (!currentRestaurant && restaurant) {
          // ถ้ายังไม่มีร้านในตะกร้า ให้ตั้งร้านใหม่
          set({ restaurant })
        }
        
        // หาสินค้าที่เหมือนกันโดยดูจาก name, price, instructions, extras
        const existingItem = get().items.find(item => 
          item.name === newItem.name && 
          item.price === newItem.price &&
          item.instructions === newItem.instructions &&
          item.extras === newItem.extras
        )
        
        if (existingItem) {
          // ถ้าเจอสินค้าเหมือนกัน ให้เพิ่มจำนวน
          set(state => ({
            items: state.items.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }))
        } else {
          // ถ้าไม่เจอ ให้เพิ่มเป็นรายการใหม่
          set(state => ({
            items: [...state.items, { ...newItem, quantity: 1 }]
          }))
        }
        
        // Update totals
        const updatedItems = get().items
        set({
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
        
        return true
      },

      canAddFromRestaurant: (restaurantId) => {
        const currentRestaurant = get().restaurant
        return !currentRestaurant || currentRestaurant.id === restaurantId
      },

      removeItem: (id) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }))
        
        // Update totals
        const updatedItems = get().items
        set({
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        }))
        
        // Update totals
        const updatedItems = get().items
        set({
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
      },

      clearCart: () => {
        set({ items: [], restaurant: null, totalItems: 0, totalPrice: 0 })
      },

      getItemQuantity: (id) => {
        const item = get().items.find(item => item.id === id)
        return item?.quantity || 0
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      }
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
) 