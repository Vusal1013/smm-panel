-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) politikaları
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi verilerini görebilir
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir (balance hariç)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Yeni kullanıcı kaydında profil oluşturma
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories tablosu
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services tablosu
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  processing_time INTEGER NOT NULL, -- saat cinsinden
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Balance requests tablosu
CREATE TABLE IF NOT EXISTS balance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  receipt_image TEXT NOT NULL, -- Base64 encoded image
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for balance_requests
ALTER TABLE balance_requests ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi bakiye taleplerini görebilir
CREATE POLICY "Users can view own balance requests" ON balance_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar bakiye talebi oluşturabilir
CREATE POLICY "Users can create balance requests" ON balance_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders tablosu
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi siparişlerini görebilir
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar sipariş oluşturabilir
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Örnek kategoriler ekle
INSERT INTO categories (name) VALUES 
  ('Instagram'),
  ('YouTube'),
  ('Twitter'),
  ('TikTok')
ON CONFLICT DO NOTHING;

-- Örnek servisler ekle
INSERT INTO services (category_id, name, price, processing_time, description) 
SELECT 
  c.id,
  'Instagram Takipçi',
  0.50,
  24,
  '1000 Instagram takipçi - Gerçek ve aktif hesaplar'
FROM categories c WHERE c.name = 'Instagram'
ON CONFLICT DO NOTHING;

INSERT INTO services (category_id, name, price, processing_time, description) 
SELECT 
  c.id,
  'Instagram Beğeni',
  0.10,
  1,
  '100 Instagram beğeni - Hızlı teslimat'
FROM categories c WHERE c.name = 'Instagram'
ON CONFLICT DO NOTHING;

-- Kullanıcı bakiyesi güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION add_user_balance(user_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET balance = balance + amount 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin kullanıcı oluşturma fonksiyonu (isteğe bağlı)
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS VOID AS $$
BEGIN
  -- Bu fonksiyon manuel olarak çağrılacak
  NULL;
END;
$$ LANGUAGE plpgsql;