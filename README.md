# POS Kedai AA — Dimsum & Ice Cream Nyemil

Aplikasi kasir (POS) untuk **Kedai Dimsum AA & Ice Cream Nyemil**.
Berjalan sebagai **APK Android** (Capacitor) dengan **Supabase** sebagai database cloud.

## Fitur
- Kasir POS: pencarian, filter kategori, diskon, pembayaran Tunai/QRIS/Kartu, struk thermal 58mm.
- Antrean dapur dengan timer keterlambatan.
- Laporan penjualan & produk terlaris.
- Manajemen produk, kategori, dan stok.
- Akun admin & kasir (ganti password di menu Pengaturan).
- Mode offline: cache data + antrean transaksi otomatis.

## Menjalankan (pengembangan)
```bash
npm install
npm run dev
```
Buka `http://localhost:5173` (hanya mode dev). Build produksi menampilkan halaman akses privat di browser.

## Build APK
```bash
npm run build
npx cap sync android
cd android && gradlew.bat assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`

## Konfigurasi Supabase
Salin `.env.example` ke `.env`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
Jalankan `schema.sql` di SQL Editor Supabase.

## Catatan
- Akses web produksi dinonaktifkan; gunakan APK.
- Ganti password default segera setelah instalasi melalui menu Pengaturan.
- Jangan gunakan `service_role key` di aplikasi.