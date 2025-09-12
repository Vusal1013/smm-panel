# SMM Panel

Modern ve kullanıcı dostu SMM (Social Media Marketing) paneli. Next.js, Supabase ve Tailwind CSS ile geliştirilmiştir.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: Kayıt, giriş ve profil yönetimi
- **Bakiye Sistemi**: Manat (₼) para birimi ile bakiye yükleme
- **Sipariş Yönetimi**: Sosyal medya hizmetleri için sipariş verme
- **Admin Paneli**: Kapsamlı yönetim araçları
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Icons**: Lucide React
- **Deployment**: Netlify

## 📦 Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd SMM-Panel
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Veritabanını kurun**
- Supabase dashboard'ınızda SQL Editor'ı açın
- `supabase-schema.sql` dosyasının içeriğini çalıştırın

5. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

## 🌐 Deployment

### Netlify'a Deploy Etme

1. **GitHub'a push edin**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Netlify'da yeni site oluşturun**
- [Netlify Dashboard](https://app.netlify.com) açın
- "New site from Git" seçin
- GitHub repository'nizi seçin

3. **Build ayarlarını yapın**
- Build command: `npm run build`
- Publish directory: `out`

4. **Environment variables ekleyin**
- Site settings > Environment variables
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` ekleyin

## 👤 Admin Paneli

Admin paneline erişim için:

1. Normal kullanıcı olarak kayıt olun
2. Dashboard'da "Admin Yap" butonuna tıklayın
3. "Admin Panel" butonuyla admin paneline erişin

### Admin Özellikleri:
- **Dashboard**: Sistem istatistikleri
- **Bakiye Yönetimi**: Bakiye taleplerini onaylama/reddetme
- **Sipariş Yönetimi**: Sipariş durumlarını güncelleme
- **Kullanıcı Yönetimi**: Kullanıcıları yönetme

## 💰 Para Birimi

Sistem Azerbaycan Manatı (₼) kullanmaktadır.

## 📱 Sayfalar

- `/` - Ana sayfa
- `/login` - Giriş
- `/register` - Kayıt
- `/dashboard` - Kullanıcı paneli
- `/balance` - Bakiye yükleme
- `/orders` - Sipariş geçmişi
- `/admin/dashboard` - Admin paneli
- `/admin/balance` - Admin bakiye yönetimi
- `/admin/orders` - Admin sipariş yönetimi
- `/admin/users` - Admin kullanıcı yönetimi

## 🔒 Güvenlik

- Row Level Security (RLS) politikaları
- Supabase Authentication
- Admin yetki kontrolü
- Güvenli veritabanı fonksiyonları

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.