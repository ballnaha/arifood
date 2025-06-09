/**
 * Utility functions for handling slugs with Thai language support
 */

/**
 * สร้าง slug จากข้อความที่รองรับภาษาไทย
 * @param text ข้อความต้นฉบับ
 * @returns slug ที่เหมาะสำหรับ URL
 */
export function createSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    // รองรับตัวอักษรไทย ตัวเลข และตัวอักษรภาษาอังกฤษ
    .replace(/[^a-z0-9ก-๙เแโใไำัิีึุูเาียืออรลว]/g, '-')
    // แทนที่ขีดหลายตัวด้วยขีดเดียว
    .replace(/-+/g, '-')
    // ลบขีดที่ต้นและท้าย
    .replace(/^-|-$/g, '');
}

/**
 * ตรวจสอบว่า slug ถูกต้องหรือไม่
 * @param slug slug ที่ต้องการตรวจสอบ
 * @returns true ถ้า slug ถูกต้อง
 */
export function validateSlug(slug: string): boolean {
  // ตรวจสอบว่ามีเฉพาะตัวอักษรไทย อังกฤษ ตัวเลข และขีด
  const slugRegex = /^[a-z0-9ก-๙เแโใไำัิีึุูเาียืออรลว-]+$/;
  
  // ต้องไม่เริ่มหรือจบด้วยขีด
  const validFormat = !slug.startsWith('-') && !slug.endsWith('-');
  
  // ต้องไม่มีขีดซ้อนกัน
  const noDoubleHyphens = !slug.includes('--');
  
  return slugRegex.test(slug) && validFormat && noDoubleHyphens && slug.length > 0;
}

/**
 * แปลง slug กลับเป็นชื่อที่อ่านได้
 * @param slug slug ที่ต้องการแปลง
 * @returns ชื่อที่อ่านได้
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * เข้ารหัส slug สำหรับใช้ใน URL (สำหรับภาษาไทย)
 * @param slug slug ที่ต้องการเข้ารหัส
 * @returns slug ที่เข้ารหัสแล้ว
 */
export function encodeSlug(slug: string): string {
  return encodeURIComponent(slug);
}

/**
 * ถอดรหัส slug จาก URL (สำหรับภาษาไทย)
 * @param encodedSlug slug ที่เข้ารหัสแล้ว
 * @returns slug ที่ถอดรหัสแล้ว
 */
export function decodeSlug(encodedSlug: string): string {
  try {
    return decodeURIComponent(encodedSlug);
  } catch (error) {
    // ถ้าถอดรหัสไม่ได้ ให้คืนค่าเดิม
    return encodedSlug;
  }
}

/**
 * ตัวอย่างการใช้งาน slug กับภาษาไทย
 */
export const EXAMPLE_SLUGS = {
  thai: {
    input: 'ผัดไทยกุ้งสด',
    slug: 'ผัดไทยกุ้งสด',
    encoded: encodeURIComponent('ผัดไทยกุ้งสด')
  },
  mixed: {
    input: 'Tom Yum Goong ต้มยำกุ้ง',
    slug: 'tom-yum-goong-ต้มยำกุ้ง',
    encoded: encodeURIComponent('tom-yum-goong-ต้มยำกุ้ง')
  },
  english: {
    input: 'Grilled Chicken Salad',
    slug: 'grilled-chicken-salad',
    encoded: 'grilled-chicken-salad'
  }
}; 