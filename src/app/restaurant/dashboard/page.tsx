import { Metadata } from 'next';
import RestaurantDashboardClient from './client';

export const metadata: Metadata = {
  title: 'แดชบอร์ดร้านอาหาร | AriFood',
  description: 'จัดการออเดอร์และรับการแจ้งเตือนแบบเรียลไทม์',
};

// ในการใช้งานจริง ควรดึงข้อมูลร้านจาก session หรือ authentication
// ตัวอย่างนี้ใช้ข้อมูลตัวอย่าง
async function RestaurantDashboardPage() {
  // TODO: ดึงข้อมูลร้านจาก authentication
  const restaurantId = 'restaurant-1'; // ตัวอย่าง
  const restaurantName = 'ร้านอาหารตัวอย่าง'; // ตัวอย่าง

  return (
    <RestaurantDashboardClient 
      restaurantId={restaurantId}
      restaurantName={restaurantName}
    />
  );
}

export default RestaurantDashboardPage; 