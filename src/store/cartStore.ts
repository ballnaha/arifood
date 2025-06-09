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
}

interface CartStore {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  _hasHydrated: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (id: string) => number
  setHasHydrated: (state: boolean) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      _hasHydrated: false,

      addItem: (newItem) => {
        const items = get().items
        // หาสินค้าที่เหมือนกันโดยดูจาก name, price, instructions, extras
        const existingItem = items.find(item => 
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
        set({ items: [], totalItems: 0, totalPrice: 0 })
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