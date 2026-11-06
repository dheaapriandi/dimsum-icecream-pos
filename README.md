# 🥟🍦 POS Kedai AA — Android APK + Supabase

Aplikasi kasir Point of Sale (POS) untuk **Kedai Dimsum AA & Ice Cream Nyemil**.
Aplikasi berjalan sebagai **APK Android** (Capacitor) dan memakai **Supabase** sebagai
database cloud. **Akses melalui browser web ditutup total** — aplikasi hanya bisa
dibuka dari APK yang terpasang di perangkat.

---

## 🏗️ Arsitektur

```
┌─────────────────────┐        HTTPS        ┌──────────────────────────┐
│  APK Android        │  ────────────────▶  │  Supabase (Cloud)        │
│  (Capacitor/WebView)│                     │  Postgres + REST API     │
│                     │  ◀────────────────  │  users, products, orders │
└─────────────────────┘        JSON         └──────────────────────────┘
          │
          └── cache lokal (localStorage) + antrean transaksi offline
```

- **Supabase** menyimpan produk, kategori, transaksi, stok, dan akun kasir.
- **APK** berisi tampilan aplikasi; data diambil langsung dari Supabase.
- Jika internet putus, aplikasi memakai **cache terakhir** dan transaksi baru
  masuk **antrean offline** yang dikirim otomatis saat koneksi kembali.
- **Web ditutup**: build produksi yang dibuka lewat browser hanya menampilkan
  halaman "Akses Sistem Privat" dan tidak bisa masuk dengan cara apa pun.

---

## ✨ Fitur Utama

- **POS Kasir**: pencarian cepat, filter kategori, catatan per item, diskon,
  pembayaran Tunai / QRIS / Kartu, dan struk thermal 58mm.
- **Antrean Dapur**: monitor pesanan pending dengan timer keterlambatan.
- **Laporan Penjualan**: pendapatan harian, grafik, produk terlaris, riwayat.
- **Manajemen Produk & Stok**: tambah/edit/hapus produk dan kategori.
- **Akun & Peran**: admin dan kasir, ganti password.
- **Mode Offline**: cache data + antrean transaksi otomatis.
- **Khusus APK**: akses web diblokir.

---

## 📁 Struktur Folder Penting

```
dimsum-icecream-pos/
├── src/
│   ├── supabase.js          # Data layer: Supabase + cache/offline
│   ├── App.jsx              # Login, gate web, navigasi, sinkronisasi offline
│   └── components/          # Tampilan kasir, dapur, laporan, pengaturan
├── schema.sql               # Skema database untuk Supabase
├── .env.example             # Contoh konfigurasi Supabase
├── capacitor.config.json    # Konfigurasi Capacitor
├── android/                 # Project Android native
├── build-apk.bat            # Build APK sekali klik (Windows)
└── Kedai-AA-POS.apk         # Hasil build APK
```

Folder `arsip/server-privat/` adalah server Node.js lama yang **tidak dipakai lagi**
(bisa dihapus kapan saja). Folder ini diabaikan oleh git.

---

## ☁️ 1. Menyiapkan Supabase

1. Buat akun di [supabase.com](https://supabase.com) lalu **New Project**.
2. Buka **SQL Editor**, tempel seluruh isi `schema.sql`, lalu **Run**.
   Script ini membuat tabel `users`, `categories`, `products`, `orders`,
   `order_items` beserta data awal (menu + akun default).
3. Buka **Project Settings → API**, catat:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
4. Salin `.env.example` menjadi `.env` di root proyek, lalu isi:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> Gunakan **anon key**, bukan `service_role key`. File `.env` sudah diabaikan git.

---

## 🧪 2. Menjalankan Versi Web (Hanya untuk Pengembangan)

Web produksi diblokir. Untuk pengembangan lokal, mode `dev` tetap bisa dibuka:

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Ini **hanya** aktif saat `npm run dev`
(flag `import.meta.env.DEV`). Build produksi (`npm run build`) selalu menampilkan
halaman blokir di browser.

---

## 📱 3. Build APK Android

### Prasyarat

- **Node.js 20+**
- **JDK 21** (set `JAVA_HOME` ke folder JDK 21)
- **Android SDK** (Android Studio / command line tools)

### Cara cepat (Windows)

Klik dua kali `build-apk.bat`, atau jalankan:

```bat
npm install
npm run apk
```

### Perintah manual

```bash
npm install
npm run build
npx cap sync android
cd android
gradlew.bat assembleDebug
```

APK hasil build:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Salin menjadi `Kedai-AA-POS.apk` di root proyek (sudah otomatis dilakukan
`build-apk.bat`).

### Build lewat GitHub Actions

Workflow `.github/workflows/build-apk.yml` membuat APK otomatis saat push ke `main`.
Tambahkan **Repository Secrets**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

(Repository → Settings → Secrets and variables → Actions → New repository secret)

---

## 📲 4. Memasang APK & Login

1. Salin `Kedai-AA-POS.apk` ke HP/tablet Android.
2. Izinkan "Install dari sumber tidak dikenal" bila diminta.
3. Buka aplikasi **Kedai AA POS**.
4. Login dengan akun default:

| Peran | Username | Password |
|-------|----------|----------|
| Admin | `cindy`  | `123`    |
| Kasir | `kasir`  | `123`    |

> Segera ganti password default melalui menu **Pengaturan**.

---

## 🔒 5. Akses Web Ditutup

Aplikasi mendeteksi platform saat dijalankan:

- **Android (Capacitor)** → aplikasi berjalan normal.
- **Browser, build produksi** → hanya halaman "Akses Sistem Privat".
  Tidak ada PIN, tidak ada `?admin=true`, tidak ada bypass.
- **Browser, `npm run dev`** → diizinkan untuk pengembangan.

Konsekuensi dan saran:

- **Jangan** mempublikasikan folder `dist/` ke hosting publik. Kalau tetap
  di-deploy (misalnya Vercel), pengunjung hanya melihat halaman blokir.
- Pemblokiran ini terjadi di sisi aplikasi. Kode JavaScript tetap bisa dibaca
  orang yang mengunduh bundle, dan **anon key Supabase** tertanam di APK.
  Karena itu:
  - Jangan pernah memakai `service_role key` di aplikasi.
  - Batasi siapa yang memegang file APK.
  - Untuk keamanan tingkat produksi, gunakan **Supabase Auth + RLS**
    (lihat bagian Keamanan).

---

## 🔌 6. Mode Offline & Sinkronisasi

- Setiap kali data berhasil diambil dari Supabase, hasilnya di-cache ke
  `localStorage` (`pos_products`, `pos_categories`, `pos_orders`, `pos_users`).
- Saat internet putus:
  - Daftar produk, kategori, dan riwayat transaksi tetap tampil dari cache.
  - Transaksi baru disimpan lokal dan masuk antrean `pos_pending_orders`.
  - Stok di cache langsung dikurangi agar tampilan akurat.
- Saat online kembali, aplikasi otomatis mengirim antrean:
  - Setiap 30 detik.
  - Saat event `online` browser/WebView.
  - Setelah transaksi baru dibuat.
- Banner di atas menampilkan jumlah **transaksi menunggu sinkronisasi**.
- Invoice unik mencegah transaksi ganda saat pengiriman ulang.

---

## 💾 7. Backup & Restore

Data ada di Supabase, bukan di HP:

- **Backup**: Supabase Dashboard → Database → Backups (atau export tabel via SQL).
- **Restore**: jalankan ulang `schema.sql` di project baru, lalu impor data
  dari backup.
- **Reset data**: jalankan `schema.sql` lagi (script menghapus tabel lama).

---

## 🔐 8. Keamanan

Skema bawaan `schema.sql`:

- Menonaktifkan RLS agar aplikasi bisa membaca/menulis langsung dengan anon key.
- Menyimpan password pengguna apa adanya (plaintext) di tabel `users`.

Ini cukup untuk toko kecil dengan APK yang dijaga, tetapi **bukan** praktik terbaik.
Untuk meningkatkan keamanan:

1. Aktifkan **Supabase Auth** (email/password) untuk login kasir.
2. Aktifkan **RLS** di semua tabel dan buat policy berdasarkan user login.
3. Jangan simpan password plaintext; gunakan Auth bawaan Supabase.
4. Ganti password default `cindy` dan `kasir`.
5. Rotasi anon key bila APK bocor, lalu build ulang.
6. Jangan bagikan akses dashboard Supabase ke staf kasir.

---

## 🧰 9. Troubleshooting

| Masalah | Penyebab & Solusi |
|---------|-------------------|
| Browser hanya menampilkan halaman blokir | Normal. Akses web produksi memang ditutup. Gunakan APK, atau `npm run dev` untuk pengembangan. |
| APK menampilkan mode Local Storage | `.env` belum terisi saat build. Isi `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`, lalu build ulang APK. |
| Login gagal padahal akun benar | Tabel `users` belum dibuat. Jalankan `schema.sql` di SQL Editor Supabase. |
| Data tidak muncul | Periksa URL/anon key, koneksi internet, dan status project Supabase (tidak paused). |
| Transaksi offline tidak terkirim | Buka aplikasi saat online; tunggu banner pending hilang. Periksa console log bila tetap gagal. |
| `BUILD FAILED` saat build APK | Pastikan `JAVA_HOME` menunjuk ke JDK 21 dan Android SDK terpasang. |
| APK lama masih muncul | Uninstall APK lama, lalu pasang ulang hasil build terbaru. |

---

## 🏷️ 10. Release APK (Opsional)

Untuk distribusi resmi (Play Store / tanpa "unknown sources"):

1. Buat keystore:
   ```bash
   keytool -genkey -v -keystore kedai-aa.keystore -alias kedaiaa \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Tambahkan konfigurasi signing di `android/app/build.gradle`.
3. Build:
   ```bash
   cd android
   gradlew.bat assembleRelease
   ```
4. Simpan keystore dan password di tempat aman. Kehilangan keystore berarti
   tidak bisa memperbarui aplikasi yang sudah terpasang.

---

## 📄 Lisensi

Proyek ini mengikuti lisensi repository asli. Silakan gunakan dan modifikasi
untuk kebutuhan Kedai Dimsum AA & Ice Cream Nyemil.
