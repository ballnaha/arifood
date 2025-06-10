'use client'

import dynamic from 'next/dynamic'

const AdminClient = dynamic(() => import('./client'), {
  loading: () => null
})

export default function AdminPage() {
  return <AdminClient />
} 