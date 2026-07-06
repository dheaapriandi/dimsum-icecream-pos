# 🥟🍦 POS Kedai AA - Kasir POS Pintar

Aplikasi kasir Point of Sale (POS) premium yang didesain khusus untuk usaha kuliner Kedai Dimsum AA & Ice Cream Nyemil. Dibuat menggunakan React (Vite) dengan styling Light Mode yang menawan, terintegrasi dengan Supabase untuk cloud database, dan siap di-deploy ke Vercel serta di-print menggunakan printer thermal 58mm (seperti EPPOS EPX588).

---

## 🚀 Fitur Utama

- **POS Kasir (Cashier POS)**: Pencarian cepat, filter kategori, penambahan catatan per item, kalkulasi otomatis (pajak 10%, diskon, subtotal), dan modal pembayaran (Tunai dengan tombol cepat, QRIS Dummy, dan EDC Kartu).
- **Struk Khusus EPPOS EPX588**: Format struk kasir 58mm dengan font monospace, dotted dividers, dan layout cetak otomatis bersih (menyembunyikan antarmuka POS saat di-print).
- **Antrean Dapur (Kitchen Monitor)**: Monitor status pesanan pending secara real-time untuk dapur dengan timer keterlambatan pesanan (>10 menit akan berwarna merah).
- **Laporan Penjualan (Analytics Dashboard)**: Metrik ringkasan pendapatan harian, grafik distribusi metode pembayaran, daftar produk terlaris, dan histori transaksi lengkap untuk mencetak ulang struk.
- **Manajemen Menu (Inventory)**: Form tambah, edit, hapus menu, pengelolaan stok, dan fitur sembunyikan/tampilkan menu dari kasir POS secara instan.
- **Offline Fallback (Local Storage)**: Sistem langsung bekerja otomatis menggunakan database lokal jika kredensial Supabase Cloud belum diatur.

---

## 🛠️ Langkah Menjalankan Aplikasi Secara Lokal

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal Node.js di komputer Anda (Node.js sudah terinstal melalui sistem setup Antigravity).

### 2. Jalankan Server Dev
Buka PowerShell/Terminal di direktori proyek ini dan jalankan perintah:
```bash
# Untuk menjalankan mode developer lokal
npm run dev
```
Setelah dijalankan, buka alamat `http://localhost:5173` di web browser Anda.

---

## ☁️ Integrasi Supabase Cloud Database

Aplikasi ini dapat terhubung ke Supabase Database Anda. Jika belum terhubung, aplikasi akan menggunakan simulasi data (Local Storage) secara otomatis. Untuk menghubungkannya ke Cloud:

### 1. Inisialisasi Database
1. Buat akun gratis dan buat project baru di [Supabase](https://supabase.com).
2. Masuk ke menu **SQL Editor** pada dashboard Supabase Anda.
3. Buka file [schema.sql](file:///C:/Users/Dezka/.gemini/antigravity/scratch/dimsum-icecream-pos/schema.sql), salin seluruh isi kodenya, tempelkan ke SQL Editor Supabase, lalu jalankan (**Run**).

### 2. Konfigurasi Environment Variables
1. Duplikat file `.env.example` di folder proyek ini dan ganti namanya menjadi `.env`.
2. Buka file `.env` tersebut dan ganti isian berikut dengan kredensial dari dashboard Supabase Anda (Menu **Project Settings** -> **API**):
   ```env
   VITE_SUPABASE_URL=https://id-project-anda.supabase.co
   VITE_SUPABASE_ANON_KEY=token-anon-key-anda
   ```
3. Mulai ulang dev server (`npm run dev`) untuk memuat konfigurasi database baru.

---

## ⚡ Deployment ke Vercel & Source GitHub

Untuk membagikan atau merilis aplikasi ini ke cloud menggunakan Vercel:

1. **Push ke GitHub**:
   - Buat repositori baru di akun GitHub Anda (misal: `dimsum-icecream-pos`).
   - Jalankan perintah berikut di folder proyek Anda:
     ```bash
     git remote add origin https://github.com/username-anda/dimsum-icecream-pos.git
     git push -u origin main
     ```
2. **Deploy di Vercel**:
   - Masuk ke dashboard [Vercel](https://vercel.com).
   - Klik **Add New** -> **Project**, lalu impor repositori GitHub yang baru Anda buat.
   - Di bagian **Environment Variables**, tambahkan dua variabel berikut:
     - `VITE_SUPABASE_URL` (isi dengan URL Supabase Anda)
     - `VITE_SUPABASE_ANON_KEY` (isi dengan Anon Key Supabase Anda)
   - Klik **Deploy**. Selesai!
