import Link from 'next/link'
import { ArrowRight, Users, Zap, Shield, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">SMM Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Sosyal Medya
            <span className="text-indigo-600"> Hizmetleri</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Instagram, YouTube, Twitter, TikTok ve daha fazlası için profesyonel sosyal medya hizmetleri. 
            Hızlı, güvenli ve uygun fiyatlı çözümler.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center justify-center"
            >
              Hemen Başla
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg text-lg font-medium"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden Bizi Seçmelisiniz?</h2>
            <p className="text-xl text-gray-600">Sosyal medya büyümeniz için ihtiyacınız olan her şey</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hızlı Teslimat</h3>
              <p className="text-gray-600">Siparişleriniz dakikalar içinde işleme alınır ve hızla teslim edilir.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Güvenli Ödeme</h3>
              <p className="text-gray-600">Tüm ödemeleriniz güvenli şekilde işlenir ve korunur.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Destek</h3>
              <p className="text-gray-600">Uzman ekibimiz size 7/24 destek sağlamaya hazır.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h2>
            <p className="text-xl text-gray-600">Tüm sosyal medya platformları için çözümler</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Instagram', 'YouTube', 'Twitter', 'TikTok'].map((platform) => (
              <div key={platform} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{platform}</h3>
                  <p className="text-gray-600 text-sm">Takipçi, beğeni, görüntülenme ve daha fazlası</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">SMM Panel</h3>
            <p className="text-gray-400 mb-8">Sosyal medya büyümeniz için güvenilir partner</p>
            <div className="flex justify-center space-x-6">
              <Link href="/login" className="text-gray-400 hover:text-white">Giriş Yap</Link>
              <Link href="/register" className="text-gray-400 hover:text-white">Kayıt Ol</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}