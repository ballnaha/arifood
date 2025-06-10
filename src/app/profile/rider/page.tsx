'use client'

import dynamic from 'next/dynamic'

const RiderProfileClient = dynamic(() => import('./client'), {
  loading: () => null
})

export default function RiderProfilePage() {
  return <RiderProfileClient />
} 