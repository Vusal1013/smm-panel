'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Users, Shield, User, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  full_name: string
  balance: number
  is_admin: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const { userProfile } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [balanceModal, setBalanceModal] = useState<{ show: boolean; user: UserProfile | null; amount: string }>({
    show: false,
    user: null,
    amount: ''
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

      await loadUsers()
      setLoading(false)
    }

    checkAuth()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      toast.success(`Kullanıcı ${!currentStatus ? 'admin yapıldı' : 'admin yetkisi kaldırıldı'}`)
      await loadUsers()
    } catch (error) {
      console.error('Admin durumu güncellenirken hata:', error)
      toast.error('Admin durumu güncellenirken hata oluştu')
    }
  }

  const updateUserBalance = async (userId: string, amount: number, operation: 'add' | 'subtract') => {
    try {
      const finalAmount = operation === 'add' ? amount : -amount
      
      const { error } = await supabase.rpc('add_user_balance', {
        user_id: userId,
        amount: finalAmount
      })

      if (error) throw error

      toast.success(`Bakiye ${operation === 'add' ? 'eklendi' : 'düşürüldü'}`)
      await loadUsers()
      setBalanceModal({ show: false, user: null, amount: '' })
    } catch (error) {
      console.error('Bakiye güncellenirken hata:', error)
      toast.error('Bakiye güncellenirken hata oluştu')
    }
  }

  const handleBalanceUpdate = (operation: 'add' | 'subtract') => {
    const amount = parseFloat(balanceModal.amount)
    if (!amount || amount <= 0 || !balanceModal.user) {
      toast.error('Geçerli bir miktar girin')
      return
    }

    updateUserBalance(balanceModal.user.id, amount, operation)
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
              <Link
                href="/admin/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-indigo-600">Kullanıcı Yönetimi</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tüm Kullanıcılar</h2>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz kullanıcı bulunmuyor</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bakiye
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-full mr-3">
                            {user.is_admin ? (
                              <Shield className="h-5 w-5 text-indigo-600" />
                            ) : (
                              <User className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'İsim belirtilmemiş'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₼{user.balance.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_admin 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_admin ? 'Admin' : 'Kullanıcı'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setBalanceModal({ show: true, user, amount: '' })}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs bg-blue-100 rounded"
                          >
                            Bakiye Düzenle
                          </button>
                          {user.id !== userProfile?.id && (
                            <button
                              onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                              className={`px-2 py-1 text-xs rounded ${
                                user.is_admin
                                  ? 'text-red-600 hover:text-red-900 bg-red-100'
                                  : 'text-green-600 hover:text-green-900 bg-green-100'
                              }`}
                            >
                              {user.is_admin ? 'Admin Kaldır' : 'Admin Yap'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Balance Modal */}
      {balanceModal.show && balanceModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Bakiye Düzenle - {balanceModal.user.full_name}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Mevcut Bakiye: ₼{balanceModal.user.balance.toFixed(2)}
              </p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={balanceModal.amount}
                onChange={(e) => setBalanceModal({ ...balanceModal, amount: e.target.value })}
                placeholder="Miktar girin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleBalanceUpdate('add')}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ekle
              </button>
              <button
                onClick={() => handleBalanceUpdate('subtract')}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Minus className="h-4 w-4 mr-1" />
                Düş
              </button>
              <button
                onClick={() => setBalanceModal({ show: false, user: null, amount: '' })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}