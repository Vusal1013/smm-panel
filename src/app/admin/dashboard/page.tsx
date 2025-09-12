'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Users, Wallet, ShoppingCart, Package, LogOut, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  totalUsers: number
  totalBalance: number
  pendingBalanceRequests: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
}

export default function AdminDashboard() {
  const { user, userProfile, logout } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBalance: 0,
    pendingBalanceRequests: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Admin kontrolü
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }

      await loadStats()
      setLoading(false)
    }

    checkAuth()
  }, [])

  const loadStats = async () => {
    try {
      // Toplam kullanıcı sayısı
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Toplam bakiye
      const { data: balanceData } = await supabase
        .from('users')
        .select('balance')

      const totalBalance = balanceData?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0

      // Bekleyen bakiye talepleri
      const { count: pendingBalanceRequests } = await supabase
        .from('balance_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Sipariş istatistikleri
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const { count: completedOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      setStats({
        totalUsers: totalUsers || 0,
        totalBalance,
        pendingBalanceRequests: pendingBalanceRequests || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        completedOrders: completedOrders || 0
      })
    } catch (error) {
      console.error('Stats yüklenirken hata:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    router.push('/')
    toast.success('Çıkış yapıldı')
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
              <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Admin: {userProfile?.full_name}</span>
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
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Toplam Kullanıcı</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Toplam Bakiye</h3>
                <p className="text-2xl font-bold text-green-600">₼{stats.totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bekleyen Bakiye</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingBalanceRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Toplam Sipariş</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bekleyen Sipariş</h3>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tamamlanan</h3>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/balance"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bakiye Yönetimi</h3>
                <p className="text-gray-600">Bakiye taleplerini yönet</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sipariş Yönetimi</h3>
                <p className="text-gray-600">Siparişleri yönet</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kullanıcı Yönetimi</h3>
                <p className="text-gray-600">Kullanıcıları yönet</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}