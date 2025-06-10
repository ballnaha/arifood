'use client'

import dynamic from 'next/dynamic'

const CustomerProfileClient = dynamic(() => import('./client'), {
  loading: () => null
})

export default function CustomerProfilePage() {
  return <CustomerProfileClient />
}
