'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Check, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface BalanceRequest {
  id: string
  user_id: string
  amount: number
  receipt_image: string
  status: 'pending' | 'approved' | 'rejected'
  note: string
  created_at: string
  users: {
    full_name: string
    email: string
  }
}

export default function AdminBalancePage() {
  const { userProfile } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<BalanceRequest[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

      await loadRequests()
      setLoading(false)
    }

    checkAuth()
  }, [])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('balance_requests')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Bakiye talepleri yüklenirken hata:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    }
  }

  const handleApprove = async (requestId: string, userId: string, amount: number) => {
    try {
      // Bakiye talebini onayla
      const { error: updateError } = await supabase
        .from('balance_requests')
        .update({ status: 'approved' })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Kullanıcının bakiyesini güncelle
      const { error: balanceError } = await supabase.rpc('add_user_balance', {
        user_id: userId,
        amount: amount
      })

      if (balanceError) throw balanceError

      toast.success('Bakiye talebi onaylandı')
      await loadRequests()
    } catch (error) {
      console.error('Bakiye onaylanırken hata:', error)
      toast.error('Bakiye onaylanırken hata oluştu')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('balance_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      toast.success('Bakiye talebi reddedildi')
      await loadRequests()
    } catch (error) {
      console.error('Bakiye reddedilirken hata:', error)
      toast.error('Bakiye reddedilirken hata oluştu')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor'
      case 'approved':
        return 'Onaylandı'
      case 'rejected':
        return 'Reddedildi'
      default:
        return status
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
              <Link
                href="/admin/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-indigo-600">Bakiye Yönetimi</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Bakiye Talepleri</h2>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Henüz bakiye talebi bulunmuyor</p>
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
                      Miktar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.users.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.users.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₼{request.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedImage(request.receipt_image)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Dekontu Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id, request.user_id, request.amount)}
                                className="text-green-600 hover:text-green-900"
                                title="Onayla"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reddet"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ödeme Dekontu</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Ödeme Dekontu"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}