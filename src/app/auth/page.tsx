'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CUSTOMER',
    restaurantData: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: ''
    }
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = '/api/auth'
      const method = isLogin ? 'PUT' : 'POST'
      
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        if (data.user.role === 'RESTAURANT_OWNER') {
          router.push('/restaurant/dashboard')
        } else {
          router.push('/')
        }
      } else {
        alert(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'ยังไม่มีบัญชี?' : 'มีบัญชีแล้ว?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-orange-600 hover:text-orange-500 ml-1"
          >
            {isLogin ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ประเภทผู้ใช้
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="CUSTOMER">ลูกค้า</option>
                    <option value="RESTAURANT_OWNER">เจ้าของร้านค้า</option>
                  </select>
                </div>

                {formData.role === 'RESTAURANT_OWNER' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700">ข้อมูลร้านค้า</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        ชื่อร้าน
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.restaurantData.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          restaurantData: {...formData.restaurantData, name: e.target.value}
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        คำอธิบายร้าน
                      </label>
                      <textarea
                        value={formData.restaurantData.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          restaurantData: {...formData.restaurantData, description: e.target.value}
                        })}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        ที่อยู่
                      </label>
                      <input
                        type="text"
                        value={formData.restaurantData.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          restaurantData: {...formData.restaurantData, address: e.target.value}
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="tel"
                        value={formData.restaurantData.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          restaurantData: {...formData.restaurantData, phone: e.target.value}
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        อีเมลร้าน
                      </label>
                      <input
                        type="email"
                        value={formData.restaurantData.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          restaurantData: {...formData.restaurantData, email: e.target.value}
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {loading ? 'กำลังดำเนินการ...' : (isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 