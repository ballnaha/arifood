'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import RestaurantChangeDialog from '@/components/RestaurantChangeDialog'

interface RestaurantDialogState {
  isOpen: boolean
  currentRestaurant?: string
  newRestaurant?: string
  onConfirm?: () => void
  onCancel?: () => void
}

interface RestaurantDialogContextType {
  showDialog: (params: {
    currentRestaurant: string
    newRestaurant: string
    onConfirm: () => void
    onCancel: () => void
  }) => void
  hideDialog: () => void
}

const RestaurantDialogContext = createContext<RestaurantDialogContextType | undefined>(undefined)

interface RestaurantDialogProviderProps {
  children: ReactNode
}

export function RestaurantDialogProvider({ children }: RestaurantDialogProviderProps) {
  const [dialogState, setDialogState] = useState<RestaurantDialogState>({
    isOpen: false
  })

  const showDialog = (params: {
    currentRestaurant: string
    newRestaurant: string
    onConfirm: () => void
    onCancel: () => void
  }) => {
    setDialogState({
      isOpen: true,
      currentRestaurant: params.currentRestaurant,
      newRestaurant: params.newRestaurant,
      onConfirm: params.onConfirm,
      onCancel: params.onCancel
    })
  }

  const hideDialog = () => {
    setDialogState({
      isOpen: false
    })
  }

  const handleConfirm = () => {
    dialogState.onConfirm?.()
    hideDialog()
  }

  const handleCancel = () => {
    dialogState.onCancel?.()
    hideDialog()
  }

  return (
    <RestaurantDialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      <RestaurantChangeDialog
        open={dialogState.isOpen}
        currentRestaurant={dialogState.currentRestaurant}
        newRestaurant={dialogState.newRestaurant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </RestaurantDialogContext.Provider>
  )
}

export function useRestaurantDialog() {
  const context = useContext(RestaurantDialogContext)
  if (context === undefined) {
    throw new Error('useRestaurantDialog must be used within a RestaurantDialogProvider')
  }
  return context
} 