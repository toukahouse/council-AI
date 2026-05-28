# Chatbot Council

Chatbot Council adalah aplikasi web *roleplay chatbot* interaktif yang dilengkapi dengan fitur *memory*, pembuatan skenario, personalisasi tema gelembung chat (*bubble chat*), dan terintegrasi dengan teknologi AI dari Google (Gemini) menggunakan arsitektur proxy khusus.

## Fitur Utama

- **Real-time AI Chat**: Ngobrol secara dinamis dengan karakter AI yang Anda rancang sendiri.
- **Kustomisasi Karakter & Skenario**: Atur sifat (*persona*), jalan cerita, NPC, dan memori obrolan sesuka hati.
- **Waktu Relatif Terintegrasi**: Sinkronisasi waktu antara antarmuka (*UI*) dan ingatan AI.
- **Advanced UI Personalization**: Kustomisasi warna, efek transparan (*Glassmorphism*), neon, hingga animasi gelembung percakapan.
- **Database Terintegrasi**: Menggunakan Prisma ORM (dengan PostgreSQL) untuk menyimpan percakapan secara permanen.
- **Proxy Khusus API AI**: Dilengkapi *Antigravity Proxy* untuk membypass API khusus.

---

## Prasyarat (*Prerequisites*)

Sebelum mulai menginstal proyek ini di komputer Anda, pastikan Anda telah memiliki:

1. [Node.js](https://nodejs.org/en) (Disarankan versi LTS, v18 atau v20+)
2. [Git](https://git-scm.com/)
3. PostgreSQL Server (Baik lokal seperti pgAdmin, XAMPP/WAMP dengan addon PostgreSQL, atau layanan *cloud* seperti Neon / Supabase).

---

## Panduan Instalasi & Persiapan (*Setup Guide*)

Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan aplikasi setelah berhasil *clone* dari *repository*.

### 1. Clone Repository & Install Dependency

Buka terminal/CMD dan jalankan perintah berikut:

```bash
# 1. Clone repo ke komputer lokal Anda
git clone https://github.com/USERNAME/chatbot-council.git

# 2. Masuk ke dalam direktori proyek
cd chatbot-council

# 3. Instal semua paket yang dibutuhkan
npm install
```

### 2. Siapkan File Environment (`.env`)

Proyek ini membutuhkan akses ke database dan *credential* API rahasia. 
Buat *file* bernama `.env` di dalam folder utama proyek (sejajar dengan `package.json`), atau gandakan dari file `.env.example`:

```bash
cp .env.example .env
```

Buka file `.env` tersebut dan isi nilainya sesuai dengan yang Anda miliki:

```env
# URL Koneksi PostgreSQL Anda
DATABASE_URL="postgresql://user:password@host:port/database_name?sslmode=require"

# API Key Gemini Anda
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"

# Pengaturan Proxy Antigravity (Cookie)
GEMINI_COOKIE_1PSID="ISI_DENGAN_COOKIE_1PSID_ANDA"
GEMINI_COOKIE_1PSIDTS="ISI_DENGAN_COOKIE_1PSIDTS_ANDA"
BROWSER_NAME="edge"
GEMINI_MODEL="gemini-3-pro-plus"
```

*Catatan: Pastikan Anda **TIDAK PERNAH** mem-publish file `.env` ini ke GitHub! (Sudah dicegah oleh `.gitignore` secara default).*

### 3. Migrasi & Sinkronisasi Database Prisma

Agar aplikasi dapat menyimpan riwayat obrolan Anda, Anda harus menyesuaikan skema database terlebih dahulu.
Jalankan perintah ini untuk mendorong (*push*) skema tabel proyek ke *database* SQL Anda:

```bash
npm run db:push
```

Jika berhasil, Prisma akan memvalidasi koneksi Anda dan membuat tabel-tabel seperti `Message`, `Persona`, `Scenario`, dll di database PostgreSQL Anda.

### 4. Menjalankan Aplikasi (*Development Mode*)

Aplikasi ini menggunakan 3 lapisan (*services*) yang berjalan serentak:
1. **Frontend (Vite/React)**
2. **Backend Server (Express)**
3. **AI Proxy Server**

Anda tidak perlu menyalakannya satu per satu. Cukup gunakan skrip otomatis ini:

```bash
npm run dev:all
```

*Tunggu hingga semua server selesai melakukan inisialisasi.*

- Aplikasi *Web* bisa Anda akses melalui: `http://localhost:5173`
- *Backend Server* berjalan di port: `3001`
- *Proxy Server* berjalan di port: `3002`

---

## Struktur Proyek Utama

- `/src`: Kode Frontend (Vite + React + CSS)
- `/server`: Kode Backend Server Express & Antigravity Proxy
- `/prisma`: File konfigurasi database Prisma ORM dan file skema (`schema.prisma`)
- `.env`: (Harus dibuat manual) File tempat meletakkan kata sandi, token, dan tautan *database* Anda.

## Pemecahan Masalah (*Troubleshooting*)

- **Prisma: "Can't reach database server"** 
  Pastikan *connection string* di variabel `DATABASE_URL` pada `.env` sudah benar dan *database* Anda sedang aktif.
- **Pesan AI tidak muncul (Gagal Generate)**
  Pastikan *cookies* (`GEMINI_COOKIE_1PSID`, dll) Anda di `.env` masih valid dan belum kedaluwarsa.
