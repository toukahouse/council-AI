# Menggunakan base image Node.js (Debian base lebih lengkap daripada Alpine untuk Python)
FROM node:20-bookworm-slim

# Install Python dan dependencies sistem
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv build-essential psmisc procps && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# (Opsional) Jika AI Anda butuh Puppeteer web scraping
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy package.json dan install backend & frontend dependencies
COPY package*.json ./
RUN npm install

# Copy seluruh source code project Anda
COPY . .

# Generate Prisma Client (Wajib untuk database)
RUN npx prisma generate

# Build React/Vite Frontend
RUN npm run build

# Buat virtual environment Python untuk Council AI & Universal Web2API Proxy
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install module Python yang dibutuhkan oleh council_ai.py & gemini-claude-web2api
RUN pip install --no-cache-dir google-genai requests curl_cffi httpx

# Expose port backend dan proxy internal (3001: Backend, 8081: Gemini, 8082: Claude, 8083: Panel)
EXPOSE 3001
EXPOSE 8081
EXPOSE 8082
EXPOSE 8083

# Command untuk menjalankan server (Pastikan script start menjalankan Node.js Anda)
CMD ["npm", "run", "start"]
 