/**
 * Prototype Chatbot Server
 * 
 * Standalone server that integrates the Antigravity Proxy logic directly.
 * Serves the HTML chat UI and exposes the proxy API endpoints on the same port.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// We must use dynamic imports here because ES module static imports are hoisted
// and would execute BEFORE dotenv.config(), causing constants to miss the env vars.
await import('./antigravity/utils/proxy.js');
const { default: proxyApp, accountManager } = await import('./antigravity/server.js');
const { logger } = await import('./antigravity/utils/logger.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const app = express();

// 1. Mount all the proxy endpoints from the Antigravity proxy logic
app.use(proxyApp);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.clear();
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║             Antigravity Chatbot Prototype                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🚀 Prototype Server berjalan di: http://localhost:${PORT}      ║
║  ✅ API Proxy terintegrasi (Zero-config needed!)             ║
║                                                              ║
║  - Buka browser ke http://localhost:${PORT}                     ║
║  - Proxy engine meminjam logika dari parent project          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
