'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Upload, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BalancePage() {
  const { user, userProfile, setUserProfile } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [receiptImage, setReceiptImage] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Kullanıcı profilini al
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !receiptImage || !user) {
      toast.error('Lütfen tüm alanları doldurun')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('balance_requests')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(amount),
            receipt_image: receiptImage,
            note: note,
            status: 'pending'
          }
        ])

      if (error) {
        toast.error('Bir hata oluştu')
        return
      }

      toast.success('Bakiye yükleme talebiniz gönderildi!')
      setAmount('')
      setNote('')
      setReceiptImage(null)
      
      // Form'u sıfırla
      const form = e.target as HTMLFormElement
      form.reset()
      
    } catch (error) {
      toast.error('Bir hata oluştu')
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
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Geri
              </Link>
              <h1 className="text-2xl font-bold text-indigo-600">Bakiye Yükle</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Balance */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <Wallet className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mevcut Bakiye</h2>
              <p className="text-2xl font-bold text-indigo-600">
                ₼{userProfile?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Request Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Bakiye Yükleme Talebi</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Yüklenecek Miktar (₼)
              </label>
              <input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="100.00"
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
                placeholder="Ödeme ile ilgili notlarınız..."
              />
            </div>

            <div>
              <label htmlFor="receipt" className="block text-sm font-medium text-gray-700">
                Ödeme Dekontu
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {receiptImage ? (
                    <div className="mb-4">
                      <img
                        src={receiptImage}
                        alt="Ödeme Dekontu"
                        className="mx-auto h-32 w-auto rounded-md"
                      />
                      <p className="text-sm text-green-600 mt-2">Dekont yüklendi</p>
                    </div>
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="receipt"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Dosya seç</span>
                      <input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        required
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">veya sürükle bırak</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF 10MB'a kadar</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Ödeme Bilgileri</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Banka:</strong> Ziraat Bankası</p>
                <p><strong>IBAN:</strong> TR12 3456 7890 1234 5678 9012 34</p>
                <p><strong>Ad Soyad:</strong> SMM Panel Ltd.</p>
                <p className="mt-2 text-xs">
                  Ödemenizi yaptıktan sonra dekontunu yükleyip talebinizi gönderin. 
                  Talebiniz 24 saat içinde incelenecektir.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Gönderiliyor...' : 'Talep Gönder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}