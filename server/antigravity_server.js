/**
 * Prototype Chatbot Server
 * 
 * Standalone server that integrates the Antigravity Proxy logic directly.
 * Serves the HTML chat UI and exposes the proxy API endpoints on the same port.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize proxy support from parent before other imports
import './antigravity/utils/proxy.js';
// Import the core proxy app and account manager from parent
import proxyApp, { accountManager } from './antigravity/server.js';
import { logger } from './antigravity/utils/logger.js';

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
