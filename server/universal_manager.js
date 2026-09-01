// server/universal_manager.js - Universal Proxy Lifecycle & Management Controller
import fs from 'fs';
import path from 'path';
import net from 'net';
import os from 'os';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ON_WINDOWS = process.platform === 'win32';

// Base directories
const WEB2API_DIR = path.resolve(__dirname, '..', 'gemini-claude-web2api');
const GEMINI_DIR = path.join(WEB2API_DIR, 'gemini');
const CLAUDE_DIR = path.join(WEB2API_DIR, 'claude');

const GEMINI_COOKIE_FILE = path.join(GEMINI_DIR, 'cookie.txt');
const CLAUDE_COOKIE_FILE = path.join(CLAUDE_DIR, 'cookie_claude.txt');

const GEMINI_LOG = ON_WINDOWS ? path.join(os.tmpdir(), 'gemini_proxy.log') : '/tmp/gemini_proxy.log';
const CLAUDE_LOG = ON_WINDOWS ? path.join(os.tmpdir(), 'claude_proxy.log') : '/tmp/claude_proxy.log';
const PANEL_LOG = ON_WINDOWS ? path.join(os.tmpdir(), 'panel.log') : '/tmp/panel.log';

const GEMINI_PORT = 8081;
const CLAUDE_PORT = 8082;
const PANEL_PORT = 8083;

// Helper: Resolve best python binary
function getPythonBin() {
  if (ON_WINDOWS) return 'python';
  // Check virtualenv paths on Docker/VPS
  const venvPython3 = '/app/venv/bin/python3';
  const venvPython = '/app/venv/bin/python';
  if (fs.existsSync(venvPython3)) return venvPython3;
  if (fs.existsSync(venvPython)) return venvPython;
  return 'python3';
}

// Helper: Ensure config.json exists
function ensureConfigFile(service) {
  const dir = service === 'gemini' ? GEMINI_DIR : (service === 'claude' ? CLAUDE_DIR : WEB2API_DIR);
  fs.mkdirSync(dir, { recursive: true });

  const configFile = path.join(dir, 'config.json');
  if (!fs.existsSync(configFile)) {
    const exampleFile = path.join(dir, service === 'claude' ? 'config.example.json' : 'config.json.example');
    if (fs.existsSync(exampleFile)) {
      try {
        fs.copyFileSync(exampleFile, configFile);
      } catch (e) {}
    } else {
      const defaultCfg = service === 'gemini' 
        ? { port: GEMINI_PORT, host: "0.0.0.0", default_model: "gemini-3.7-flash", log_requests: true }
        : { port: CLAUDE_PORT, model: "claude-haiku-4-5-20251001", log_requests: true };
      try {
        fs.writeFileSync(configFile, JSON.stringify(defaultCfg, null, 2), 'utf8');
      } catch (e) {}
    }
  }
  return configFile;
}

// Helper: Check if a TCP port is open
export function checkPort(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      status = true;
      socket.destroy();
    });
    socket.once('timeout', () => {
      socket.destroy();
    });
    socket.once('error', () => {
      socket.destroy();
    });
    socket.once('close', () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
}

// Helper: Parse cookie expiry from Netscape format
export function parseCookieExpiry(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const now = Math.floor(Date.now() / 1000);
    let minSecs = null;

    const lines = content.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#') || line.startsWith('http')) continue;
      const parts = line.split('\t');
      if (parts.length >= 5) {
        const expiry = parseInt(parts[4], 10);
        if (!isNaN(expiry) && expiry > now) {
          const secs = expiry - now;
          if (secs >= 3600) {
            if (minSecs === null || secs < minSecs) {
              minSecs = secs;
            }
          }
        }
      }
    }

    if (minSecs === null) return null;
    return {
      hours: Math.round((minSecs / 3600) * 10) / 10,
      days: Math.round((minSecs / 86400) * 10) / 10
    };
  } catch (e) {
    return null;
  }
}

// Helper: Read log lines
export function readLogFile(filePath, maxLines = 60) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    return lines.slice(-maxLines).join('\n');
  } catch (e) {
    return `[Error reading log: ${e.message}]`;
  }
}

// Helper: Kill processes listening on a port
export function killPort(port) {
  return new Promise((resolve) => {
    if (ON_WINDOWS) {
      exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
        if (!err && stdout) {
          const pids = new Set();
          const lines = stdout.split('\n');
          for (const line of lines) {
            if (line.includes(`:${port}`) && line.includes('LISTENING')) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 5) {
                pids.add(parts[parts.length - 1]);
              }
            }
          }
          if (pids.size > 0) {
            let killed = 0;
            pids.forEach((pid) => {
              exec(`taskkill /F /PID ${pid}`, () => {
                killed++;
                if (killed === pids.size) resolve(true);
              });
            });
            return;
          }
        }
        resolve(false);
      });
    } else {
      // Linux: Try fuser, lsof, and ss kill fallbacks
      const cmd = `fuser -k ${port}/tcp 2>/dev/null || (lsof -ti:${port} | xargs -r kill -9) 2>/dev/null || (ss -lptn 'sport = :${port}' | grep -oP 'pid=\\K[0-9]+' | xargs -r kill -9) 2>/dev/null || true`;
      exec(cmd, () => resolve(true));
    }
  });
}

// Restart or Start Proxy Process
export async function restartProxy(service) {
  const isGemini = service === 'gemini';
  const isClaude = service === 'claude';
  const isPanel = service === 'panel';

  if (!isGemini && !isClaude && !isPanel) {
    return { success: false, message: `Unknown service: ${service}` };
  }

  const port = isGemini ? GEMINI_PORT : (isClaude ? CLAUDE_PORT : PANEL_PORT);
  const proxyDir = isGemini ? GEMINI_DIR : (isClaude ? CLAUDE_DIR : WEB2API_DIR);
  const logFile = isGemini ? GEMINI_LOG : (isClaude ? CLAUDE_LOG : PANEL_LOG);

  // Ensure directories exist
  fs.mkdirSync(proxyDir, { recursive: true });
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  ensureConfigFile(service);

  // 1. Kill old process on port
  await killPort(port);
  await new Promise((r) => setTimeout(r, 600));

  // 2. Spawn python process
  const pythonCmd = getPythonBin();
  let scriptArgs = [];

  if (isGemini) {
    const scriptPath = path.join(GEMINI_DIR, 'gemini_web2api.py');
    if (!fs.existsSync(scriptPath)) {
      return { success: false, message: `File ${scriptPath} tidak ditemukan di server.` };
    }
    const configFile = path.join(GEMINI_DIR, 'config.json');
    scriptArgs = [
      scriptPath,
      '--config', configFile,
      '--cookie-file', GEMINI_COOKIE_FILE
    ];
  } else if (isClaude) {
    const scriptPath = path.join(CLAUDE_DIR, 'claude_web2api.py');
    if (!fs.existsSync(scriptPath)) {
      return { success: false, message: `File ${scriptPath} tidak ditemukan di server.` };
    }
    scriptArgs = [scriptPath];
  } else if (isPanel) {
    const scriptPath = path.join(WEB2API_DIR, 'panel.py');
    if (!fs.existsSync(scriptPath)) {
      return { success: false, message: `File ${scriptPath} tidak ditemukan di server.` };
    }
    scriptArgs = [scriptPath, '--port', '8083'];
  }

  try {
    const outLog = fs.openSync(logFile, 'a');
    fs.writeSync(outLog, `\n--- Restarted ${service} at ${new Date().toISOString()} ---\n`);

    const child = spawn(pythonCmd, scriptArgs, {
      cwd: proxyDir,
      detached: true,
      stdio: ['ignore', outLog, outLog],
      windowsHide: true
    });

    child.unref();

    return {
      success: true,
      message: `${service} proxy restarted successfully (PID ${child.pid})`
    };
  } catch (err) {
    return { success: false, message: `Failed to start ${service}: ${err.message}` };
  }
}

// Auto-start proxies on server boot
export async function autoStartProxies() {
  try {
    const [geminiAlive, claudeAlive, panelAlive] = await Promise.all([
      checkPort(GEMINI_PORT),
      checkPort(CLAUDE_PORT),
      checkPort(PANEL_PORT)
    ]);

    if (!geminiAlive && fs.existsSync(GEMINI_COOKIE_FILE)) {
      console.log('🤖 Auto-starting Gemini Web Proxy (Port 8081)...');
      await restartProxy('gemini');
    }

    if (!claudeAlive && fs.existsSync(CLAUDE_COOKIE_FILE)) {
      console.log('🤖 Auto-starting Claude Web Proxy (Port 8082)...');
      await restartProxy('claude');
    }

    if (!panelAlive && fs.existsSync(path.join(WEB2API_DIR, 'panel.py'))) {
      console.log('🤖 Auto-starting Universal Panel Router (Port 8083)...');
      await restartProxy('panel');
    }
  } catch (e) {
    console.warn('Auto start proxies check notice:', e.message);
  }
}

// Get comprehensive status
export async function getUniversalStatus() {
  const [geminiAlive, claudeAlive, panelAlive] = await Promise.all([
    checkPort(GEMINI_PORT),
    checkPort(CLAUDE_PORT),
    checkPort(PANEL_PORT)
  ]);

  const geminiCookie = parseCookieExpiry(GEMINI_COOKIE_FILE);
  const claudeCookie = parseCookieExpiry(CLAUDE_COOKIE_FILE);

  let claudeUsage = null;
  if (claudeAlive) {
    try {
      const res = await fetch(`http://127.0.0.1:${CLAUDE_PORT}/v1/usage`, { timeout: 2000 });
      if (res.ok) {
        claudeUsage = await res.json();
      }
    } catch (e) {}
  }

  return {
    gemini: {
      alive: geminiAlive,
      installed: fs.existsSync(path.join(GEMINI_DIR, 'gemini_web2api.py')),
      port: GEMINI_PORT,
      cookie_exists: fs.existsSync(GEMINI_COOKIE_FILE),
      cookie_expiry_days: geminiCookie?.days || null,
      cookie_expiry_hours: geminiCookie?.hours || null,
      log_exists: fs.existsSync(GEMINI_LOG)
    },
    claude: {
      alive: claudeAlive,
      installed: fs.existsSync(path.join(CLAUDE_DIR, 'claude_web2api.py')),
      port: CLAUDE_PORT,
      cookie_exists: fs.existsSync(CLAUDE_COOKIE_FILE),
      cookie_expiry_days: claudeCookie?.days || null,
      cookie_expiry_hours: claudeCookie?.hours || null,
      log_exists: fs.existsSync(CLAUDE_LOG),
      usage: claudeUsage
    },
    panel: {
      alive: panelAlive,
      port: PANEL_PORT
    }
  };
}

// Paste and save cookies
export async function saveCookies(service, rawCookieText) {
  if (!rawCookieText || rawCookieText.trim().length < 20) {
    return { success: false, message: 'Cookie teks terlalu pendek atau kosong.' };
  }

  const isGemini = service === 'gemini';
  const isClaude = service === 'claude';

  if (!isGemini && !isClaude) {
    return { success: false, message: 'Service harus "gemini" atau "claude".' };
  }

  // Cross-service mismatch validation with friendly warnings
  if (isClaude && (rawCookieText.includes('.google.com') || rawCookieText.includes('SAPISID') || rawCookieText.includes('__Secure-3PSIDTS'))) {
    return {
      success: false,
      message: '⚠️ Cookie yang kamu masukkan adalah cookie Google (Gemini), bukan Claude. Silakan ekspor cookie dari https://claude.ai untuk modal Claude, atau pilih menu "Update Cookie Google Gemini".'
    };
  }

  if (isGemini && (rawCookieText.includes('claude.ai') || rawCookieText.includes('sessionKey=sk-ant-sid01-'))) {
    return {
      success: false,
      message: '⚠️ Cookie yang kamu masukkan adalah cookie Anthropic Claude, bukan Google Gemini. Silakan ekspor cookie dari https://gemini.google.com untuk modal Gemini, atau pilih menu "Update Cookie Anthropic Claude".'
    };
  }

  const targetFile = isGemini ? GEMINI_COOKIE_FILE : CLAUDE_COOKIE_FILE;

  // Validate Netscape/tab structure
  const lines = rawCookieText.trim().split('\n');
  let validLines = 0;
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('\t');
    if (parts.length >= 5) validLines++;
  }

  if (validLines < 2 && !rawCookieText.includes('SAPISID=') && !rawCookieText.includes('sessionKey=')) {
    return {
      success: false,
      message: `Hanya ${validLines} baris cookie valid terdeteksi. Silakan gunakan format Netscape/cookies.txt dari extension Cookie-Editor atau cookies.txt.`
    };
  }

  try {
    // Ensure destination directory exists on VPS/Docker container
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    ensureConfigFile(service);

    fs.writeFileSync(targetFile, rawCookieText.trim(), 'utf8');
    const restartResult = await restartProxy(service);
    return {
      success: true,
      message: `Berhasil menyimpan cookie untuk ${service} (${validLines} entri) dan me-restart proxy. ${restartResult.message || ''}`
    };
  } catch (err) {
    return { success: false, message: `Gagal menulis file cookie: ${err.message}` };
  }
}

// Test proxy health with short completion
export async function testProxyHealth(service) {
  const isGemini = service === 'gemini';
  const isClaude = service === 'claude';
  const port = isGemini ? GEMINI_PORT : (isClaude ? CLAUDE_PORT : PANEL_PORT);
  const model = isGemini ? 'gemini-3.7-flash' : 'claude-haiku-4-5-20251001';

  const t0 = Date.now();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say hello in 3 words or less.' }],
        max_tokens: 15
      }),
      signal: AbortSignal.timeout(25000)
    });

    const elapsed = Math.round((Date.now() - t0) / 10) / 100;
    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || JSON.stringify(data);
      return { success: true, response: text.trim(), time: elapsed };
    } else {
      const errText = await res.text();
      return { success: false, response: `HTTP ${res.status}: ${errText.slice(0, 300)}`, time: elapsed };
    }
  } catch (err) {
    const elapsed = Math.round((Date.now() - t0) / 10) / 100;
    return { success: false, response: `Koneksi gagal: ${err.message}`, time: elapsed };
  }
}

// Get models list
export async function getUniversalModels() {
  // If panel (8083) is active, fetch from panel
  try {
    const res = await fetch(`http://127.0.0.1:${PANEL_PORT}/api/models`, {
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (e) {}

  // Fallback defaults
  return [
    { id: 'gemini-3.7-flash', name: '3.7 Flash - Bantuan Serbaguna (Terkini & Cepat)', provider: 'gemini', desc: 'Model terbaru Google yang cepat, cerdas, dan responsif' },
    { id: 'gemini-3.5-flash-thinking', name: 'Penalaran yang Diperluas (Deep Thinking)', provider: 'gemini', desc: 'Pemecahan masalah kompleks & penalaran mendalam' },
    { id: 'gemini-3.1-pro', name: '3.1 Pro - Penalaran Canggih (Coding & Logika)', provider: 'gemini', desc: 'Penalaran tingkat tinggi untuk logika dan penulisan' },
    { id: 'gemini-3.5-flash-lite', name: '3.5 Flash-Lite - Tercepat & Ringan', provider: 'gemini', desc: 'Jawaban super instan' },
    { id: 'gemini-3.5-flash', name: '3.5 Flash - Cepat & Pintar', provider: 'gemini', desc: 'Model serbaguna untuk roleplay sehari-hari' },
    { id: 'gemini-pro', name: 'Gemini Pro - Alias 3.1 Pro', provider: 'gemini', desc: 'Model flagship Gemini Pro' },
    { id: 'gemini-auto', name: 'Gemini Auto - Pemilihan Otomatis', provider: 'gemini', desc: 'Pilihan otomatis dari sistem' },
    { id: 'claude-haiku-4-5-20251001', name: 'Haiku 4.5 - Tercepat & Cerdas', provider: 'claude', desc: 'Model Claude terbaru yang cepat dan sangat pintar' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet - Coding & Menulis Terbaik', provider: 'claude', desc: 'Model paling cerdas untuk narasi dan deskripsi detail' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku - Ringan & Responsif', provider: 'claude', desc: 'Respons cepat dengan gaya bahasa natural' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus - Flagship Analytical', provider: 'claude', desc: 'Pemahaman mendalam dan karakter kuat' }
  ];
}
