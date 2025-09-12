'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, ShoppingCart, Clock, Package } from 'lucide-react'
import toast from 'react-hot-toast'

interface Service {
  id: string
  category_id: string
  name: string
  price: number
  processing_time: number
  description: string
  categories: {
    name: string
  }
}

export default function NewOrderPage() {
  const { user, userProfile } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [quantity, setQuantity] = useState('1000')
  const [note, setNote] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      await loadServices()
      
      // URL'den service parametresini al
      const serviceId = searchParams.get('service')
      if (serviceId) {
        const service = services.find(s => s.id === serviceId)
        if (service) {
          setSelectedService(service)
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [services])

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('name')

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Hizmetler yüklenirken hata:', error)
      toast.error('Hizmetler yüklenirken hata oluştu')
    }
  }

  const calculateTotal = () => {
    if (!selectedService || !quantity) return 0
    const qty = parseInt(quantity)
    return (selectedService.price * qty / 1000).toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService || !user || !userProfile) {
      toast.error('Lütfen tüm alanları doldurun')
      return
    }

    const total = parseFloat(calculateTotal())
    
    if (userProfile.balance < total) {
      toast.error('Yetersiz bakiye! Lütfen bakiye yükleyin.')
      return
    }

    setSubmitting(true)

    try {
      // Siparişi oluştur
      const { error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            service_id: selectedService.id,
            quantity: parseInt(quantity),
            total_price: total,
            note: note,
            status: 'pending'
          }
        ])

      if (orderError) throw orderError

      // Bakiyeyi düş
      const { error: balanceError } = await supabase.rpc('add_user_balance', {
        user_id: user.id,
        amount: -total
      })

      if (balanceError) throw balanceError

      toast.success('Sipariş başarıyla oluşturuldu!')
      router.push('/orders')
      
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error)
      toast.error('Sipariş oluşturulurken hata oluştu')
    } finally {
      setSubmitting(false)
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
                href="/services"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-indigo-600">Yeni Sipariş</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Balance */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mevcut Bakiye</h2>
              <p className="text-2xl font-bold text-indigo-600">
                ₼{userProfile?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <Link
              href="/balance"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Bakiye Yükle
            </Link>
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sipariş Detayları</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                Hizmet Seçin
              </label>
              <select
                id="service"
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find(s => s.id === e.target.value)
                  setSelectedService(service || null)
                }}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Hizmet seçin...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.categories.name} - {service.name} (₼{service.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedService.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedService.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  İşlem Süresi: {selectedService.processing_time} saat
                </div>
              </div>
            )}

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Miktar
              </label>
              <input
                id="quantity"
                type="number"
                min="100"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1000"
              />
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Not (Opsiyonel)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Sipariş ile ilgili notlarınız..."
              />
            </div>

            {selectedService && quantity && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-indigo-900">Toplam Tutar:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ₼{calculateTotal()}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedService || !quantity}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? (
                'Sipariş Oluşturuluyor...'
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Sipariş Ver
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}