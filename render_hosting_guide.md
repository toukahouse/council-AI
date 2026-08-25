# Panduan Migrasi & Hosting Council AI di Render.com

Panduan ini akan membantu Anda memindahkan project Web AI Anda dari VPS ke platform otomatis **Render.com** secara gratis. Render sangat pintar karena bisa membaca `Dockerfile` Anda dan menjalankannya tanpa Anda harus mengetik perintah terminal sama sekali.

> [!NOTE]
> **Prasyarat Utama:**
> Pastikan Anda sudah memindahkan database Anda dari SQLite lokal ke **PostgreSQL Online** (misalnya Supabase atau Neon). Render bersifat *ephemeral*, jadi database lokal akan terhapus jika server sedang "tidur".

---

## Langkah 1: Upload Project ke GitHub
Render tidak membutuhkan Anda untuk melakukan drag-and-drop file. Render akan langsung mengambil kodingan Anda dari GitHub.

1. Buka aplikasi **GitHub Desktop** atau gunakan terminal VS Code.
2. Pastikan file `.env` Anda **TIDAK** ikut ter-upload ke GitHub (pastikan tulisan `.env` ada di dalam file `.gitignore`). Ini sangat penting agar kunci rahasia AI Anda tidak dicuri orang.
3. Commit dan Push seluruh folder `chatbot-council` Anda ke repository GitHub Anda (bisa di-set sebagai *Private Repository* agar kodingan Anda aman).

---

## Langkah 2: Buat Akun & Sambungkan ke Render
1. Buka website [Render.com](https://render.com).
2. Klik tombol **Get Started** atau **Sign In**.
3. Pilih pendaftaran menggunakan **GitHub**. Ini akan otomatis menyambungkan akun Render Anda dengan repository kodingan Anda.

---

## Langkah 3: Buat "Web Service" Baru
Setelah masuk ke Dashboard Render:
1. Klik tombol **New +** di pojok kanan atas, lalu pilih **Web Service**.
2. Pilih opsi **Build and deploy from a Git repository**, lalu klik Next.
3. Anda akan melihat daftar repository GitHub Anda. Cari repository `chatbot-council` Anda, lalu klik **Connect**.

---

## Langkah 4: Konfigurasi Server
Sekarang Anda berada di halaman pengaturan server. Isi sesuai panduan berikut:

* **Name:** Terserah Anda (misalnya `council-ai-web`).
* **Region:** Pilih region yang paling dekat (misalnya `Singapore` jika tersedia, atau `Oregon` US).
* **Branch:** `main` (atau branch tempat kodingan Anda berada).
* **Root Directory:** *(Kosongkan saja)*
* **Environment:** **DOCKER** (Penting! Pastikan Render mendeteksi logo ikan paus Docker). Render otomatis menemukan file `Dockerfile` Anda.
* **Instance Type:** Pilih **Free** ($0 / month).

---

## Langkah 5: Masukkan Rahasia Anda (.env)
Karena kita tidak meng-upload file `.env` ke GitHub (demi keamanan), kita harus memberitahukan password rahasia tersebut langsung ke satpam Render.

1. Scroll ke bawah sampai menemukan bagian **Advanced**.
2. Klik tombol **Add Environment Variable**.
3. Masukkan satu per satu isi dari file `.env` Anda.
   
   Contohnya:
   * Key: `DATABASE_URL` | Value: `postgresql://user:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   * Key: `OPENAI_API_KEY` | Value: `sk-xxxxxxxxx`
   * Key: `PORT` | Value: `3001` *(Sesuaikan dengan port EXPOSE di Dockerfile Anda)*

> [!IMPORTANT]
> Pastikan `DATABASE_URL` Anda mengarah ke database online (PostgreSQL), bukan lagi menggunakan file `file:./dev.db`.

---

## Langkah 6: Deploy & Selesai!
1. Setelah semua rahasia dimasukkan, klik tombol **Create Web Service** di bagian paling bawah.
2. Anda akan dibawa ke halaman terminal hitam persis seperti di VPS. Di sinilah Render sedang mem-build `Dockerfile` Anda secara otomatis! (Bisa memakan waktu 5-10 menit).
3. Setelah muncul tulisan **"Your service is live 🎉"**, lihat ke pojok kiri atas. Render telah memberikan Anda domain gratis (misalnya `council-ai-web.onrender.com`).
4. Klik link tersebut, dan Web AI Anda sudah berhasil hidup di internet tanpa VPS!

---

## (Opsional) Menggunakan Domain Custom Anda
Jika Anda ingin mengganti domain gratisan dari Render dengan `supernova-chat.me` milik Anda:
1. Di Dashboard Render aplikasi Anda, pilih menu **Settings** di sebelah kiri.
2. Scroll ke bagian **Custom Domains** dan klik **Add Custom Domain**.
3. Ketikkan domain Anda (misal: `supernova-chat.me`).
4. Render akan memberitahu Anda target CNAME (misalnya `council-ai-web.onrender.com`).
5. Buka dashboard **Cloudflare**, masuk ke menu DNS, edit A/CNAME Record Anda yang lama, dan arahkan ke target yang diberikan Render tadi (Awan Oranye bisa tetap dinyalakan).
6. Dalam hitungan menit, domain cantik Anda sudah tersambung!
