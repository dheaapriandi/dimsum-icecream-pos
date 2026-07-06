-- SQL Schema untuk POS Kasir Dim Sum & Es Krim
-- Dapat dieksekusi langsung di SQL Editor Supabase

-- Hapus tabel lama jika ada (opsional)
-- DROP TABLE IF EXISTS order_items;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS products;
-- DROP TABLE IF EXISTS categories;

-- 1. Tabel Kategori (Categories)
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50), -- Nama ikon Lucide (misal: 'Utensils', 'IceCream', 'Coffee')
  color VARCHAR(20), -- Kode warna CSS atau nama variabel warna
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabel Produk (Products)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  stock INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabel Transaksi Penjualan (Orders)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_no VARCHAR(50) NOT NULL UNIQUE,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL, -- 'CASH', 'QRIS', 'CARD'
  cashier_name VARCHAR(50) DEFAULT 'Kasir Utama',
  status VARCHAR(20) DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'CANCELLED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabel Detail Transaksi (Order Items)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  notes TEXT, -- Catatan tambahan (misal: "Es krim rasa cokelat saja", "Dim sum pedas")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tambahkan indeks untuk performa pencarian
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 6. Masukkan Data Kategori Awal (Dummy)
INSERT INTO categories (name, slug, icon, color) VALUES
('Dim Sum', 'dim-sum', 'Utensils', '#f97316'), -- Steamer Orange
('Es Krim', 'es-krim', 'IceCream', '#ec4899'), -- Pink
('Minuman', 'minuman', 'Coffee', '#06b6d4'),   -- Cyan
('Camilan', 'camilan', 'Cookie', '#eab308');   -- Yellow
