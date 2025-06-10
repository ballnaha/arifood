'use client'

import dynamic from 'next/dynamic'

const RestaurantProfileClient = dynamic(() => import('./client'), {
  loading: () => null
})

export default function RestaurantProfilePage() {
  return <RestaurantProfileClient />
} 