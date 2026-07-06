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

-- 6. Masukkan Data Kategori Awal
INSERT INTO categories (id, name, slug, icon, color) VALUES
('cat-1', 'Dimsum AA', 'dimsum-aa', 'Utensils', '#f97316'),
('cat-2', 'Ice Cream Nyemil', 'ice-cream-nyemil', 'IceCream', '#ec4899');

-- 7. Masukkan Data Produk Awal
INSERT INTO products (id, name, description, price, category_id, stock, active) VALUES
-- Dimsum Original
('prod-ds-orig-1', 'Dimsum Original Satuan', '1 Pcs dimsum kukus original khas Kedai Dimsum AA.', 2000, 'cat-1', 150, TRUE),
('prod-ds-orig-5', 'Dimsum Original 1 Porsi (Isi 5)', '5 Pcs dimsum kukus original khas Kedai Dimsum AA.', 10000, 'cat-1', 60, TRUE),
-- Dimsum Mentai
('prod-ds-mentai-4', 'Dimsum Mentai Isi 4', '4 Pcs dimsum kukus dengan topping saus mentai bakar lezat khas AA.', 16000, 'cat-1', 40, TRUE),
('prod-ds-mentai-6', 'Dimsum Mentai Isi 6', '6 Pcs dimsum kukus dengan topping saus mentai bakar lezat khas AA.', 23000, 'cat-1', 30, TRUE),
-- Dimsum Goreng
('prod-ds-goreng-keju-3', 'Dimsum Goreng Keju Lumer (Isi 3)', '3 Pcs dimsum goreng renyah dengan isian keju lumer di dalamnya.', 10000, 'cat-1', 45, TRUE),
('prod-ds-goreng-mentai-keju-4', 'Dimsum Goreng Mentai Keju Lumer (Isi 4)', '4 Pcs dimsum goreng isi keju lumer disiram saus mentai bakar.', 18000, 'cat-1', 30, TRUE),
-- Ice Cream
('prod-ic-small', 'Small Cup (1 Scoop)', '1 Scoop Es Krim + Roti + Susu + 2 Topping bebas pilih.', 3000, 'cat-2', 100, TRUE),
('prod-ic-medium', 'Medium Cup (2 Scoop)', '2 Scoop Es Krim + Roti + Susu + 4 Topping bebas pilih.', 5000, 'cat-2', 100, TRUE),
('prod-ic-large', 'Large Cup (3 Scoop)', '3 Scoop Es Krim + Roti + Susu + (Full Topping).', 10000, 'cat-2', 80, TRUE),
-- Minuman / Tambahan (Kategori Dimsum AA)
('prod-ds-esteh', 'Es Teh', 'Es teh manis segar pelepas dahaga.', 2500, 'cat-1', 200, TRUE);
