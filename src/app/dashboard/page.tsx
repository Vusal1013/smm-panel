'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Wallet, ShoppingCart, Package, LogOut, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, userProfile, setUser, setUserProfile, logout } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Kullanıcı profilini al
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
        if (profile.is_admin) {
          router.push('/admin/dashboard')
          return
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/')
    toast.success('Çıkış yapıldı')
  }

  // Geçici admin yapma fonksiyonu (sadece development için)
  const makeAdmin = async () => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Admin yetkisi verildi! Sayfayı yenileyin.')
      
      // Profili güncelle
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Admin yapılırken hata:', error)
      toast.error('Admin yapılırken hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">SMM Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Hoş geldin, {userProfile?.full_name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bakiyeniz</h2>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                ₼{userProfile?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <Wallet className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Geçici Admin Butonu - Sadece admin olmayan kullanıcılar için */}
        {!userProfile?.is_admin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
                <p className="text-sm text-yellow-700">Admin paneline erişim için kendinizi admin yapın</p>
              </div>
              <button
                onClick={makeAdmin}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Admin Yap
              </button>
            </div>
          </div>
        )}

        {/* Admin Panel Link - Sadece admin kullanıcılar için */}
        {userProfile?.is_admin && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-indigo-800">Admin Paneli</h3>
                <p className="text-sm text-indigo-700">Admin paneline erişim sağlayın</p>
              </div>
              <Link
                href="/admin/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/balance"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bakiye Yükle</h3>
                <p className="text-gray-600">Hesabınıza bakiye ekleyin</p>
              </div>
            </div>
          </Link>

          <Link
            href="/orders/new"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sipariş Ver</h3>
                <p className="text-gray-600">Yeni sipariş oluşturun</p>
              </div>
            </div>
          </Link>

          <Link
            href="/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Siparişlerim</h3>
                <p className="text-gray-600">Sipariş geçmişinizi görün</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Siparişler</h3>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Henüz sipariş vermediniz</p>
            <Link
              href="/orders/new"
              className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              İlk Siparişinizi Verin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}