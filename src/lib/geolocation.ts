// Geolocation utilities for getting current location and address

export interface GeolocationPosition {
  lat: number
  lng: number
  accuracy: number
}

export interface AddressResult {
  address: string
  district?: string
  subDistrict?: string
  province?: string
  postalCode?: string
}

// Check if geolocation is supported
export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

// Get current position using browser geolocation
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        let errorMessage = 'Unable to get location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        
        reject(new Error(errorMessage))
      },
      options
    )
  })
}

// Mock reverse geocoding - ในการใช้งานจริงต้องใช้ Google Maps Geocoding API
export async function reverseGeocode(lat: number, lng: number): Promise<AddressResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock data based on approximate Bangkok areas
  if (lat >= 13.7 && lat <= 13.8 && lng >= 100.5 && lng <= 100.6) {
    // Central Bangkok area
    return {
      address: `${Math.floor(Math.random() * 999) + 1} ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330`,
      district: 'ปทุมวัน',
      subDistrict: 'ปทุมวัน',
      province: 'กรุงเทพมหานคร',
      postalCode: '10330'
    }
  } else if (lat >= 13.8 && lat <= 13.9 && lng >= 100.5 && lng <= 100.6) {
    // North Bangkok area
    return {
      address: `${Math.floor(Math.random() * 999) + 1} ถนนลาดพร้าว แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพมหานคร 10230`,
      district: 'ลาดพร้าว',
      subDistrict: 'ลาดพร้าว',
      province: 'กรุงเทพมหานคร',
      postalCode: '10230'
    }
  } else if (lat >= 13.6 && lat <= 13.7 && lng >= 100.5 && lng <= 100.6) {
    // South Bangkok area
    return {
      address: `${Math.floor(Math.random() * 999) + 1} ถนนสาทร แขวงสาทร เขตสาทร กรุงเทพมหานคร 10120`,
      district: 'สาทร',
      subDistrict: 'สาทร',
      province: 'กรุงเทพมหานคร',
      postalCode: '10120'
    }
  } else {
    // Default area
    return {
      address: `${Math.floor(Math.random() * 999) + 1} ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110`,
      district: 'คลองเตย',
      subDistrict: 'คลองเตย',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110'
    }
  }
}

// Format coordinates for display
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

// Check if coordinates are in Thailand (rough bounds)
export function isInThailand(lat: number, lng: number): boolean {
  return lat >= 5.6 && lat <= 20.5 && lng >= 97.3 && lng <= 105.6
}

// Calculate accuracy description
export function getAccuracyDescription(accuracy: number): string {
  if (accuracy <= 10) return 'ความแม่นยำสูงมาก'
  if (accuracy <= 50) return 'ความแม่นยำสูง'
  if (accuracy <= 100) return 'ความแม่นยำปานกลาง'
  if (accuracy <= 500) return 'ความแม่นยำต่ำ'
  return 'ความแม่นยำต่ำมาก'
} 