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

# Generate Prisma Client (Wajib untuk database)
RUN npx prisma generate

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