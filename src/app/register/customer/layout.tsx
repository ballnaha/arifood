import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'สมัครสมาชิกลูกค้า - AriFood',
  description: 'สมัครสมาชิกเพื่อสั่งอาหารออนไลน์กับ AriFood สะดวก รวดเร็ว ส่งถึงบ้าน',
}

export default function CustomerRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 