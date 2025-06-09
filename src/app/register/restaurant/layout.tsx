import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'สมัครร้านอาหาร - AriFood',
  description: 'สมัครเป็นพาร์ทเนอร์ร้านอาหารกับ AriFood เพิ่มยอดขายออนไลน์ ง่าย สะดวก',
}

export default function RestaurantRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 