# 🚀 Panduan Ultimate Deployment Council AI (VPS + CI/CD Docker + High Performance)

Dokumen ini adalah panduan lengkap langkah-demi-langkah (step-by-step) untuk memigrasikan project **Council AI** (React/Vite + Express.js + Python) dari sistem PM2 manual ke arsitektur **CI/CD Otomatis menggunakan Docker dan GitHub Actions** di VPS baru, dengan fokus pada **kecepatan loading web (bebas lelet)**.

> [!NOTE]
> **Catatan tentang FrankenPHP:** Pada pertanyaan sebelumnya, Anda menyebutkan tentang FrankenPHP. FrankenPHP adalah server yang sangat cepat, namun didesain khusus untuk aplikasi **PHP** (seperti Laravel/Symfony). Karena stack teknologi Anda menggunakan **Node.js (Express)** dan **Python**, kita akan menggunakan base image Node.js standar yang disesuaikan dengan Python di dalam Docker. Ini adalah arsitektur yang paling tepat dan stabil untuk aplikasi Anda.

---

## Tahap 1: Persiapan VPS Baru & Keamanan Dasar

Langkah ini dilakukan tepat setelah Anda membeli VPS baru (Sangat direkomendasikan Ubuntu 22.04 LTS atau 24.04 LTS). 
Untuk spek di bawah $10, **1 CPU Core dan 1GB atau 2GB RAM sudah sangat cukup**, asal disetting dengan benar. Penyimpanan 20GB juga cukup.

### 1. Login ke VPS
Buka terminal/CMD di PC Anda dan login menggunakan SSH (contoh jika menggunakan user nova):
```bash
ssh -i C:\Users\aa878\.ssh\gcp_nova nova@IP_VPS_ANDA
```

> [!IMPORTANT]
> **Pindah ke Mode Root:** Setelah berhasil login, Anda **wajib** mengetik perintah `sudo su -` lalu tekan Enter. Pastikan awalan terminal berubah menjadi `root@...`. Semua instalasi sistem di Tahap 1 dan Tahap 2 ini *hanya* bisa dilakukan oleh `root`.

### 2. Update Sistem
Pastikan semua package di VPS Anda up-to-date:
```bash
apt update && apt upgrade -y
```

### 3. Setup Swap Memory (Sangat Penting untuk RAM 1GB)
> [!IMPORTANT]
> Agar VPS tidak crash (Out of Memory) atau "lelet" saat menjalankan service, tambahkan memori virtual (Swap) sebesar 2GB yang diambil dari penyimpanan SSD Anda.

Jalankan perintah ini satu per satu:
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

### 4. Konfigurasi Firewall (UFW)
Amankan VPS Anda dengan hanya membuka port yang diperlukan:
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 20128/tcp # Buka port ini hanya jika 9Router diakses langsung dari luar
ufw enable
```
*(Ketik `y` lalu Enter jika ditanya).*

---

## Tahap 2: Instalasi Dependencies Inti

Kita membutuhkan Docker untuk containerisasi aplikasi dan Nginx sebagai Reverse Proxy di depan untuk mempercepat load web.

### 1. Install Docker & Docker Compose
Jalankan command resmi dari Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Install Nginx & Certbot (Untuk SSL/HTTPS)
```bash
apt install nginx certbot python3-certbot-nginx -y
```

---

## Tahap 3: Konfigurasi Docker di Project Anda (Di PC/Laptop Anda)

Buat file-file berikut di dalam root folder project `chatbot-council` Anda di VS Code.

### 1. Buat `Dockerfile`
File ini berisi resep untuk menggabungkan Node.js dan Python dalam satu wadah (container).

```dockerfile
# Menggunakan base image Node.js (Debian base lebih lengkap daripada Alpine untuk Python)
FROM node:20-bookworm-slim

# Install Python dan dependencies sistem
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# (Opsional) Jika AI Anda butuh Puppeteer web scraping
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy package.json dan install backend & frontend dependencies
COPY package*.json ./
RUN npm install

# Copy seluruh source code project Anda
COPY . .

# Build React/Vite Frontend
RUN npm run build

# Buat virtual environment Python (jika script Python Anda butuh module khusus)
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
# Jika Anda punya requirements.txt:
# RUN if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

# Expose port backend (sesuaikan dengan port Express Anda, default 3001)
EXPOSE 3001

# Command untuk menjalankan server (Pastikan script start menjalankan Node.js Anda)
CMD ["npm", "run", "start"] 
```

### 2. Buat `docker-compose.yml`
File ini akan mempermudah kita menjalankan container di VPS nanti.

```yaml
version: '3.8'

services:
  council-ai:
    # Ganti 'username_github' dengan username asli Anda
    image: ghcr.io/username_github/council-ai:latest
    container_name: council-ai-app
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      # - PORT=3001
      # Tambahkan variabel .env Anda yang lain di sini
```

---

## Tahap 4: Setup CI/CD (GitHub Actions)

Ini adalah kunci keajaiban sistem ini. Saat Anda mengubah kodingan dan melakukan `git push`, GitHub akan membuild aplikasi Anda dan VPS tinggal mendownload versi jadinya.

### 1. Buat Personal Access Token (PAT) GitHub
1. Buka GitHub -> Settings -> Developer Settings -> Personal access tokens -> Tokens (classic)
2. Generate token baru, beri nama `CR_PAT`, centang akses: `write:packages`, `read:packages`, dan `delete:packages`.
3. Copy token tersebut (simpan baik-baik).

### 2. Setup GitHub Secrets di Repo Anda
Pergi ke Repo GitHub Anda -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
Tambahkan 4 variabel ini:
- `VPS_IP` : Alamat IP VPS baru Anda.
- `VPS_USERNAME` : `root`
- `VPS_SSH_KEY` : Private key SSH untuk login VPS. *(Cara membuat: Di PC Anda, jalankan `ssh-keygen -t rsa -b 4096`. Masukkan isian file private ke GitHub Secret, dan copy isian file `.pub` ke dalam file `~/.ssh/authorized_keys` di VPS).*
- `CR_PAT`: Token yang Anda buat di langkah 1.

### 3. Buat file Workflow
Buat folder `.github/workflows` di project Anda, lalu buat file bernama `deploy.yml`:

```yaml
name: CI/CD Deploy Council AI

on:
  push:
    branches:
      - streaming # Branch utama Anda saat ini

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Login to GitHub Container Registry (GHCR)
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.CR_PAT }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/council-ai:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.VPS_IP }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            echo ${{ secrets.CR_PAT }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # Tarik image terbaru
            docker pull ghcr.io/${{ github.repository_owner }}/council-ai:latest
            
            # Buat folder kerja (Karena kita menggunakan akun nova, mari simpan dengan rapi di dalam home directory nova)
            mkdir -p /home/nova/council-ai
            cd /home/nova/council-ai
            
            # Buat file docker-compose.yml on the fly:
            cat << 'EOF' > docker-compose.yml
            version: '3.8'
            services:
              council-ai:
                image: ghcr.io/${{ github.repository_owner }}/council-ai:latest
                container_name: council-ai-app
                restart: always
                ports:
                  - "3001:3001"
            EOF
            
            # Restart service
            docker-compose down
            docker-compose up -d
            
            # Bersihkan sisa image lama agar penyimpanan lega
            docker image prune -a -f
```

---

## Tahap 5: Konfigurasi Nginx & SSL (Performa Tinggi)

Nginx di VPS bertugas menjadi "satpam" dan pengantar file statis super cepat.

### 1. Buat Konfigurasi Nginx
Di VPS:
```bash
nano /etc/nginx/sites-available/supernova-chat.me
```

Isi dengan konfigurasi optimasi ini:
```nginx
server {
    server_name supernova-chat.me www.supernova-chat.me;

    # OPTIMASI 1: Gzip Compression (Memperkecil ukuran HTML/JS/CSS secara drastis)
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # OPTIMASI 2: Cache File Statis (Vite assets) di sisi Browser
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2|woff|ttf|svg)$ {
        proxy_pass http://127.0.0.1:3001; # Arahkan ke Express
        expires 30d; # Simpan di HP/PC user selama 30 hari (bebas lelet saat dibuka lagi)
        add_header Cache-Control "public, no-transform";
    }

    # Proxy Utama ke Council AI Container
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Timeout panjang jika AI butuh waktu lama merespon
        proxy_read_timeout 300s;
    }

    # Konfigurasi khusus SSE / Streaming AI
    location /api/chat/stream {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        
        # MATIKAN BUFFER & CACHE agar text AI mengalir lancar
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
```

Aktifkan config dan restart nginx:
```bash
ln -s /etc/nginx/sites-available/supernova-chat.me /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 2. Generate SSL (HTTPS)
```bash
certbot --nginx -d supernova-chat.me -d www.supernova-chat.me
```

---

## Tahap 6: Optimasi Cloudflare Maksimal

Langkah terakhir agar web melesat secepat kilat:
1. **Proxy Aktif (Awan Orange):** Di DNS Cloudflare, pastikan A Record `supernova-chat.me` mengarah ke IP VPS baru dengan status Proxy (Awan Orange aktif).
2. **SSL Full (Strict):** Pergi ke menu SSL/TLS Cloudflare, ubah mode menjadi **Full (Strict)**.
3. **Optimasi Brotli:** Masuk ke menu **Speed** -> **Optimization** -> **Content Optimization**. Aktifkan **Brotli** (ini kompresi lebih canggih dari Gzip).
4. **Auto Minify:** Di menu yang sama, centang JS, CSS, dan HTML pada **Auto Minify**.

---

## 🏆 Mengapa Arsitektur Ini Bebas Lelet & Sangat Aman?

1. **Memori (RAM) VPS Tidak Terkuras:** Kelemahan terbesar web lambat di VPS murah ($5-$10) adalah karena proses `npm run build` yang sangat memakan CPU & RAM. Di arsitektur ini, **Server GitHub yang mem-build aplikasinya**, bukan VPS Anda! VPS Anda hanya tinggal menjalankan hasilnya. Ini membuat resource RAM 1GB Anda murni 100% dipakai untuk melayani user saja.
2. **Kecepatan Load Terjamin:** Adanya gabungan kompresi Gzip di Nginx dan Brotli + CDN di Cloudflare membuat ukuran website Anda menjadi sangat kecil. Gambar dan JS akan tersimpan di server terdekat dengan lokasi pengguna.
3. **CI/CD Seamless:** Saat Anda mengubah kodingan, Anda tidak perlu lagi buka terminal SSH ke VPS. Cukup ketik `git push origin streaming` di VS Code Anda, santai 2 menit, dan website Anda terupdate otomatis!
