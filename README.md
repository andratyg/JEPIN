# JEPIN (Jejak Pintar) — Smart Consumption & Repurchase Tracker

> **Kurasi konsumsi mandiri. Menghitung setiap rupiah dengan integritas sensoris.**

JEPIN (Jejak Pintar) adalah aplikasi web pencatatan dan evaluasi belanja personal berbasis kurasi editorial (*Warm Editorial Craft*). Dirancang untuk memutus siklus pembelian impulsif, melacak barang berkualitas (*Worth to Buy*), memblokir pembelian berulang barang yang mengecewakan (*Zonk*), serta mengaudit nominal uang yang berhasil diselamatkan.

---

## ☕ Latar Belakang & Filosofi Desain

Kebanyakan pencatat keuangan hanya mencatat angka nominal yang keluar, tanpa mengevaluasi **apakah barang tersebut layak dibeli kembali atau justru sia-sia**. 

JEPIN mengadopsi pendekatan **Ledger Sensoris**:
- **Bukan sekadar kalkulator**: Menilai barang dari kepuasan nyata, ketahanan, aroma, rasa, dan kecocokan penggunaan.
- **Audit Penghematan**: Menghitung akumulasi rupiah dari barang "Zonk" yang berhasil dicegah dari pembelian berulang.
- **Desain Warm Editorial Craft**: Tipografi elegan *Merriweather* dan *Plus Jakarta Sans* dengan palet warna organik (*Linen* `#FBF7F0`, *Ecru* `#F5EFE6`, *Espresso* `#1F2421`, *Sage* `#10B981`, dan *Terracotta* `#E05344`).

---

## ✨ Fitur Utama

### 1. 4 Siklus Hidup Konsumsi (Lifecycle States)
- **Repurchase Vault (Beli Ulang)**: Katalog barang terbaik yang sudah terbukti kualitasnya dan layak dibeli berkali-kali (dengan skor sensoris hingga skala 10).
- **Blacklist Zonk**: Daftar barang yang mengecewakan, lengkap dengan tag alasan (misal: *Aroma Apek*, *Bahan Tipis*, *Overpriced*) dan nominal rupiah yang berhasil diselamatkan.
- **Observasi Aktif (Testing)**: Masa uji coba barang (misal skincare 14 hari atau kopi 7 hari) dengan indikator progress hari.
- **Wishlist Jeda Impulsif (Cooling-Off)**: Menahan keinginan belanja instan dengan jeda waktu berpikir 7–14 hari sebelum memutuskan membeli.

### 2. Modal Evaluasi Kelayakan Konsumsi
- Alur evaluasi terstruktur untuk barang yang sedang diuji atau ada di wishlist:
  - **"Worth to Buy"**: Masuk ke brankas beli ulang dengan skor kepuasan.
  - **"Zonk (Hindari Beli Ulang)"**: Otomatis masuk blacklist dan nominal harga langsung diakumulasi ke total "Uang Terselamatkan".

### 3. Manajemen Kategori Dinamis
- Pengguna bebas menambahkan kategori baru lengkap dengan ikon emoji pilihan.
- Kategori dapat disortir, diedit, atau dihapus langsung dari antarmuka.

### 4. Shareable Audit Card ("Bukti Hemat")
- Generator sertifikat audit penghematan instan yang siap diunduh atau dibagikan ke media sosial sebagai bukti kedisiplinan finansial.

### 5. Keamanan & Autentikasi Modern
- **Strict Auth Guard**: Tanpa mode tamu untuk menjaga privasi ledger finansial pengguna.
- **Google OAuth via Supabase PKCE**: Login satu klik dengan akun Google yang aman.
- **Dual Layer Storage**: Sinkronisasi cloud database Supabase dengan resiliensi cadangan *LocalStorage* untuk akses instan.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library UI**: [React 19](https://react.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, GoTrue OAuth)
- **Tipografi**: Merriweather Serif & Plus Jakarta Sans via `next/font/google`
- **Ikon**: Heroicons & Monogram Vector Craft SVG

---

## 🚀 Panduan Menjalankan Proyek (Local Development)

### 1. Clone & Install Dependensi
```bash
git clone https://github.com/andratyg/jepin.git
cd jepin
npm install
```

### 2. Konfigurasi Environment Variables
Buat berkas `.env.local` di root folder proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Migrasi Database Supabase
Jalankan skrip yang ada di `supabase/migrations/20261031071126_new-migration.sql` atau gunakan Supabase CLI:
```bash
npx supabase db push
```

### 4. Jalankan Server Dev
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada peramban web.

---

## 🌐 Panduan Deployment (Vercel)

1. Pastikan repository telah di-push ke GitHub.
2. Di dashboard **Vercel** -> **Project Settings** -> **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Di **Google Cloud Console** -> **OAuth 2.0 Credentials**:
   - Tambahkan domain produksi Vercel ke **Authorized JavaScript origins**: `https://<nama-proyek>.vercel.app`
   - Pastikan Authorized redirect URIs mengarah ke Supabase: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Di **Supabase Dashboard** -> **Authentication** -> **URL Configuration**:
   - Tambahkan URL Vercel ke **Redirect URLs**: `https://<nama-proyek>.vercel.app/**`

---

## 📄 Lisensi

Dikembangkan oleh **Nara Andra Tyaga** ([@andratyg](https://github.com/andratyg)) — 2026.
Hak cipta dilindungi undang-undang.
