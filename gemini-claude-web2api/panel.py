#!/usr/bin/env python3
"""
Proxy Control Panel & AI Studio — Unified Web UI for Gemini & Claude local proxies.
Zero external dependencies (stdlib only).
"""

import http.server
import json
import subprocess
import time
import os
import re
import socket
import signal
import sys
import urllib.request
import urllib.error
import threading
import tempfile
import webbrowser
from datetime import datetime
from pathlib import Path
from socketserver import ThreadingMixIn
from urllib.parse import urlparse, parse_qs

ON_WINDOWS = sys.platform == "win32"

# ── Config ──────────────────────────────────────────────────────────────
PANEL_PORT = 8083
GEMINI_PORT = 8081
CLAUDE_PORT = 8082

HOME = os.path.expanduser("~")
GEMINI_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gemini")
CLAUDE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "claude")

if ON_WINDOWS:
    GEMINI_LOG = os.path.join(tempfile.gettempdir(), "gemini_proxy.log")
    CLAUDE_LOG = os.path.join(tempfile.gettempdir(), "claude_proxy.log")
else:
    GEMINI_LOG = "/tmp/gemini_proxy.log"
    CLAUDE_LOG = "/tmp/claude_proxy.log"

if not ON_WINDOWS:
    GEMINI_COOKIE_SCRIPT = os.path.join(HOME, ".local", "bin", "gemini-cookie-update")
    CLAUDE_COOKIE_SCRIPT = os.path.join(HOME, ".local", "bin", "claude-cookie-update")
else:
    GEMINI_COOKIE_SCRIPT = None
    CLAUDE_COOKIE_SCRIPT = None

GEMINI_COOKIE_FILE = os.path.join(GEMINI_DIR, "cookie.txt")
CLAUDE_COOKIE_FILE = os.path.join(CLAUDE_DIR, "cookie_claude.txt")

GEMINI_SCRIPT = os.path.join(GEMINI_DIR, "gemini_web2api.py")
CLAUDE_SCRIPT = os.path.join(CLAUDE_DIR, "claude_web2api.py")

GEMINI_REPO = "https://github.com/cyberanrhy/gemini-web2api.git"
CLAUDE_REPO = "https://github.com/cyberanrhy/claude-web2api.git"

VPN_HOST = "127.0.0.1"
VPN_PORT = 12334

# ── Helpers ─────────────────────────────────────────────────────────────

def log(msg):
    print(f"[panel] {msg}", flush=True)


def check_port(port):
    """Check if a TCP port is open."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        result = s.connect_ex(("127.0.0.1", port))
        s.close()
        return result == 0
    except Exception:
        return False


def check_vpn():
    """Check if Hiddify proxy port is open."""
    return check_port(VPN_PORT)


def http_get(url, timeout=5):
    """Make HTTP GET, return (status_code, body_or_error)."""
    try:
        req = urllib.request.Request(url)
        with _direct_opener.open(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, str(e)
    except Exception as e:
        return 0, str(e)


def http_post_json(url, data, timeout=15):
    """Make HTTP POST with JSON body, return (status_code, body_or_error)."""
    try:
        body = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        with _direct_opener.open(req, timeout=timeout) as resp:
            resp_body = resp.read().decode("utf-8", errors="replace")
            return resp.status, resp_body
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")[:500]
        return e.code, err_body
    except Exception as e:
        return 0, str(e)


_direct_opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def get_log_file(name):
    return GEMINI_LOG if name == "gemini" else CLAUDE_LOG


def read_log_file(filepath, lines=50):
    """Read the last N lines from a log file."""
    try:
        with open(filepath, "r", errors="replace") as f:
            all_lines = f.readlines()
        return "".join(all_lines[-lines:])
    except FileNotFoundError:
        return None
    except Exception as e:
        return f"[error reading log: {e}]"


def is_installed(name):
    script = GEMINI_SCRIPT if name == "gemini" else CLAUDE_SCRIPT
    return os.path.exists(script)


def install_proxy(name, force=False):
    repo_url = GEMINI_REPO if name == "gemini" else CLAUDE_REPO
    dest_dir = GEMINI_DIR if name == "gemini" else CLAUDE_DIR
    script = GEMINI_SCRIPT if name == "gemini" else CLAUDE_SCRIPT

    if is_installed(name) and not force:
        return {"success": True, "message": f"{name} is already installed at {dest_dir}"}

    backup = {}
    if force and os.path.exists(dest_dir):
        for fname in ["config.json", "cookie.txt", "cookie_claude.txt"]:
            fpath = os.path.join(dest_dir, fname)
            if os.path.exists(fpath):
                try:
                    with open(fpath) as f:
                        backup[fname] = f.read()
                except:
                    pass

    env = os.environ.copy()
    env.pop("http_proxy", None)
    env.pop("https_proxy", None)
    env.pop("HTTP_PROXY", None)
    env.pop("HTTPS_PROXY", None)

    try:
        if force and os.path.exists(dest_dir):
            import shutil
            shutil.rmtree(dest_dir, ignore_errors=True)

        os.makedirs(dest_dir, exist_ok=True)

        proc = subprocess.run(
            ["git", "clone", repo_url, dest_dir],
            capture_output=True, text=True, timeout=60, env=env,
        )
        if proc.returncode != 0:
            proc = subprocess.run(
                ["git", "clone", repo_url, dest_dir],
                capture_output=True, text=True, timeout=60,
                env={**env, "http_proxy": f"http://{VPN_HOST}:{VPN_PORT}",
                     "https_proxy": f"http://{VPN_HOST}:{VPN_PORT}"},
            )
            if proc.returncode != 0:
                return {"success": False,
                        "message": f"git clone failed: {proc.stderr[:300]}".strip()}

        example = os.path.join(dest_dir, "config.json.example")
        config = os.path.join(dest_dir, "config.json")
        if os.path.exists(example) and not os.path.exists(config):
            import shutil
            shutil.copy(example, config)

        for fname, content in backup.items():
            fpath = os.path.join(dest_dir, fname)
            try:
                with open(fpath, "w") as f:
                    f.write(content)
            except:
                pass

        restart_proxy(name)
        return {"success": True, "message": f"Installed {name} from {repo_url}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


def restart_proxy(name):
    """Kill and restart a proxy, redirecting output to log file."""
    port = GEMINI_PORT if name == "gemini" else CLAUDE_PORT
    proxy_dir = GEMINI_DIR if name == "gemini" else CLAUDE_DIR
    log_file = get_log_file(name)
    script_name = "gemini_web2api.py" if name == "gemini" else "claude_web2api.py"
    cookie_flag = "--cookie-file"
    cookie_file = GEMINI_COOKIE_FILE if name == "gemini" else CLAUDE_COOKIE_FILE
    config_file = os.path.join(proxy_dir, "config.json")

    if ON_WINDOWS:
        try:
            result = subprocess.run(
                ["netstat", "-ano"], capture_output=True, text=True, timeout=5
            )
            pids = set()
            for line in result.stdout.split("\n"):
                parts = line.strip().split()
                if f":{port}" in line and "LISTENING" in line and len(parts) >= 5:
                    pids.add(parts[-1])
            for pid in pids:
                subprocess.run(["taskkill", "/F", "/PID", pid], capture_output=True, timeout=5)
        except Exception:
            pass
    else:
        try:
            subprocess.run(
                ["fuser", "-k", f"{port}/tcp"],
                capture_output=True, timeout=5
            )
        except Exception:
            pass

    time.sleep(0.5)

    python_bin = sys.executable
    if name == "gemini":
        cmd = [
            python_bin,
            os.path.join(proxy_dir, script_name),
            "--config", config_file,
            "--cookie-file", cookie_file,
        ]
    else:
        cmd = [
            python_bin,
            os.path.join(proxy_dir, script_name),
        ]

    try:
        with open(log_file, "a") as lf:
            lf.write(f"\n--- restart at {datetime.now().isoformat()} ---\n")
            proc = subprocess.Popen(
                cmd, stdout=lf, stderr=lf,
                cwd=proxy_dir,
                stdin=subprocess.DEVNULL
            )
        return {"success": True, "message": f"PID {proc.pid}"}
    except Exception as e:
        return {"success": False, "message": str(e)}


def run_health_test(name):
    """Send a real chat completion request to the proxy."""
    port = GEMINI_PORT if name == "gemini" else CLAUDE_PORT
    url = f"http://127.0.0.1:{port}/v1/chat/completions"
    payload = {
        "model": "gemini-3.5-flash" if name == "gemini" else "claude-haiku-4-5-20251001",
        "messages": [{"role": "user", "content": "say hi in 3 words or less"}],
        "max_tokens": 10,
    }
    t0 = time.time()
    status, body = http_post_json(url, payload, timeout=120)
    elapsed = round(time.time() - t0, 3)

    if status == 200:
        try:
            data = json.loads(body)
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return {"success": True, "response": content.strip(), "time": elapsed}
        except Exception:
            return {"success": False, "response": body[:200], "time": elapsed}
    return {"success": False, "response": body[:200], "time": elapsed}


def parse_cookie_expiry(filepath):
    if not os.path.exists(filepath):
        return None
    try:
        now = time.time()
        min_secs = None
        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or line.startswith("http"):
                    continue
                parts = line.split("\t")
                if len(parts) >= 5:
                    try:
                        expiry = int(parts[4])
                        if expiry > now:
                            secs = expiry - now
                            if secs >= 3600:
                                if min_secs is None or secs < min_secs:
                                    min_secs = secs
                    except (ValueError, IndexError):
                        pass
        if min_secs is None:
            return None
        hours = round(min_secs / 3600, 1)
        days = round(min_secs / 86400, 1)
        return {"hours": hours, "days": days}
    except Exception:
        return None


def _ensure_config(name):
    proxy_dir = GEMINI_DIR if name == "gemini" else CLAUDE_DIR
    config_file = os.path.join(proxy_dir, "config.json")
    if not os.path.exists(config_file):
        example = os.path.join(proxy_dir, "config.example.json")
        if os.path.exists(example):
            try:
                with open(example) as f:
                    cfg = json.load(f)
                with open(config_file, "w") as f:
                    json.dump(cfg, f, indent=2)
            except Exception:
                pass
    return config_file


def read_config(name):
    config_file = _ensure_config(name)
    if not os.path.exists(config_file):
        return None
    try:
        with open(config_file) as f:
            cfg = json.load(f)
        return cfg.get("proxy")
    except Exception:
        return None


def write_config(name, proxy_val):
    config_file = _ensure_config(name)
    if not os.path.exists(config_file):
        return {"success": False, "message": "config.json not found"}
    try:
        with open(config_file) as f:
            cfg = json.load(f)
        if proxy_val is None:
            cfg.pop("proxy", None)
        else:
            cfg["proxy"] = proxy_val
        with open(config_file, "w") as f:
            json.dump(cfg, f, indent=2)
        restart_proxy(name)
        return {"success": True, "message": "config saved, proxy restarted"}
    except Exception as e:
        return {"success": False, "message": str(e)}


_upstream_cache = {}
def check_upstream_access():
    now = time.time()
    cached = _upstream_cache.get("result")
    cached_at = _upstream_cache.get("at", 0)
    if cached and now - cached_at < 60:
        return cached

    vpn_alive = check_vpn()

    def tcp_test(host, via_proxy=False):
        try:
            if via_proxy and vpn_alive:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(3)
                s.connect(("127.0.0.1", VPN_PORT))
                s.sendall(f"CONNECT {host}:443 HTTP/1.1\r\nHost: {host}:443\r\n\r\n".encode())
                resp = s.recv(4096, socket.MSG_PEEK)
                s.close()
                return resp.startswith(b"HTTP/") or b"200" in resp
            else:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.settimeout(3)
                s.connect((host, 443))
                s.close()
                return True
        except:
            return False

    targets = [("gemini.google.com", "gemini"), ("claude.ai", "claude")]
    results = {}
    for host, name in targets:
        direct = tcp_test(host)
        via_proxy = tcp_test(host, via_proxy=True) if vpn_alive else False
        results[name] = {"direct": direct, "proxy": via_proxy}

    _upstream_cache["result"] = results
    _upstream_cache["at"] = now
    return results


# ── API & Web Handler ────────────────────────────────────────────────────

class PanelHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        msg = fmt % args
        if "GET /api" in msg or "POST /api" in msg:
            return
        log(msg)

    def do_GET(self):
        try:
            self._do_GET()
        except Exception as e:
            log(f"do_GET error: {e}")
            try:
                self._json({"error": f"internal error: {e}"}, 500)
            except:
                pass

    def _do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path == "/" or path == "":
            self._serve_html()
        elif path == "/api/status":
            self._json(self._get_status())
        elif path == "/api/models" or path == "/v1/models":
            self._handle_get_all_models()
        elif path.startswith("/api/logs/"):
            name = path.split("/")[-1]
            if name in ("gemini", "claude"):
                qs = parse_qs(parsed.query)
                lines = int(qs.get("lines", [60])[0])
                text = read_log_file(get_log_file(name), lines)
                self._json({"name": name, "log": text, "exists": text is not None})
            else:
                self._json({"error": "unknown proxy"}, 404)
        elif path.startswith("/api/test/"):
            name = path.split("/")[-1]
            if name in ("gemini", "claude"):
                result = run_health_test(name)
                self._json(result)
            else:
                self._json({"error": "unknown proxy"}, 404)
        elif path.startswith("/api/config/"):
            name = path.split("/")[-1]
            if name in ("gemini", "claude"):
                proxy_val = read_config(name)
                self._json({"name": name, "proxy": proxy_val})
            else:
                self._json({"error": "unknown proxy"}, 404)
        elif path == "/api/upstream":
            self._json(check_upstream_access())
        else:
            self._json({"error": "not found"}, 404)

    def _handle_get_all_models(self):
        """Aggregate models from both Gemini (8081) and Claude (8082)."""
        combined = []
        claude_friendly_names = {
            "claude-sonnet-5": "Sonnet 5 - Paling Efisien untuk Tugas Sehari-hari",
            "claude-haiku-4-5-20251001": "Haiku 4.5 - Tercepat untuk Jawaban Cepat",
            "claude-sonnet-4-6": "Sonnet 4.6 - Edisi Khusus Cerdas",
            "claude-fable-5": "Fable 5 (Pro) - Untuk Tantangan Terberat Anda",
            "claude-opus-5": "Opus 5 (Pro) - Untuk Tugas Kompleks",
            "claude-opus-4-8": "Opus 4.8 (Pro) - Flagship Deep Reasoning",
            "claude-opus-4-7": "Opus 4.7 (Pro) - Advanced Analytical",
            "claude-opus-4-6": "Opus 4.6 (Pro) - High Complexity",
            "claude-3-opus-20240229": "Opus 3 (Pro) - Legacy Flagship",
            "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet - Coding & Menulis Terbaik",
            "claude-3-5-haiku-20241022": "Claude 3.5 Haiku - Ringan & Responsif",
        }

        gemini_defaults = [
            {"id": "gemini-3.7-flash", "name": "3.7 Flash - Bantuan Serbaguna (Terkini & Cepat)", "provider": "gemini"},
            {"id": "gemini-3.5-flash-thinking", "name": "Penalaran yang Diperluas - Pemecahan Masalah Kompleks (Deep Thinking)", "provider": "gemini"},
            {"id": "gemini-3.1-pro", "name": "3.1 Pro - Penalaran yang Canggih (Coding & Logika)", "provider": "gemini"},
            {"id": "gemini-3.5-flash-lite", "name": "3.5 Flash-Lite - Jawaban Tercepat & Sangat Ringan", "provider": "gemini"},
            {"id": "gemini-3.5-flash", "name": "3.5 Flash - Cepat & Pintar", "provider": "gemini"},
            {"id": "gemini-pro", "name": "Gemini Pro - Alias Model 3.1 Pro", "provider": "gemini"},
            {"id": "gemini-flash-lite", "name": "Gemini Flash-Lite - Alias 3.5 Flash-Lite", "provider": "gemini"},
            {"id": "gemini-auto", "name": "Gemini Auto - Pemilihan Model Otomatis", "provider": "gemini"},
        ]

        # Fetch Gemini 8081
        code, body = http_get(f"http://127.0.0.1:{GEMINI_PORT}/v1/models", timeout=2)
        if code == 200:
            try:
                g_data = json.loads(body).get("data", [])
                for m in g_data:
                    combined.append({
                        "id": m["id"],
                        "name": m.get("description") or m["id"],
                        "provider": "gemini"
                    })
            except Exception:
                combined.extend(gemini_defaults)
        else:
            combined.extend(gemini_defaults)

        # Fetch Claude 8082
        code, body = http_get(f"http://127.0.0.1:{CLAUDE_PORT}/v1/models", timeout=2)
        if code == 200:
            try:
                c_data = json.loads(body).get("data", [])
                for m in c_data:
                    m_id = m["id"]
                    combined.append({
                        "id": m_id,
                        "name": claude_friendly_names.get(m_id, m_id.replace("-", " ").title()),
                        "provider": "claude"
                    })
            except Exception:
                for k, v in claude_friendly_names.items():
                    combined.append({"id": k, "name": v, "provider": "claude"})
        else:
            for k, v in claude_friendly_names.items():
                combined.append({"id": k, "name": v, "provider": "claude"})

        self._json({"object": "list", "data": combined})

    def do_POST(self):
        try:
            self._do_POST()
        except Exception as e:
            log(f"do_POST error: {e}")
            try:
                self._json({"error": f"internal error: {e}"}, 500)
            except:
                pass

    def _do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path == "/api/chat/completions" or path == "/v1/chat/completions":
            self._handle_chat_forward()
            return
        elif path.startswith("/api/action/"):
            parts = path.split("/")
            if len(parts) >= 5:
                name = parts[3]
                action = parts[4]
                if name in ("gemini", "claude"):
                    if action == "restart":
                        if not is_installed(name):
                            self._json({"success": False, "message": "not installed"}, 400)
                            return
                        result = restart_proxy(name)
                        self._json(result)
                        return
                    elif action == "cookies":
                        if not is_installed(name):
                            self._json({"success": False, "message": "not installed"}, 400)
                            return
                        result = self._handle_cookies(name)
                        self._json(result)
                        return
                    elif action == "install":
                        result = install_proxy(name)
                        self._json(result)
                        return
                    elif action == "reinstall":
                        result = install_proxy(name, force=True)
                        self._json(result)
                        return
            self._json({"error": "invalid action"}, 400)
        elif path == "/api/cookies/paste/gemini" or path == "/api/cookies/paste/claude":
            name = path.split("/")[-1]
            self._handle_paste_cookies(name)
            return
        elif path.startswith("/api/config/"):
            name = path.split("/")[-1]
            if name in ("gemini", "claude"):
                try:
                    content_len = int(self.headers.get("Content-Length", 0))
                    body = json.loads(self.rfile.read(content_len))
                    proxy_val = body.get("proxy")
                    result = write_config(name, proxy_val)
                    self._json(result)
                except Exception as e:
                    self._json({"success": False, "message": str(e)}, 400)
            else:
                self._json({"error": "unknown proxy"}, 404)
        else:
            self._json({"error": "not found"}, 404)

    def _handle_chat_forward(self):
        """Forward chat completion directly to Gemini (8081) or Claude (8082) with SSE streaming support."""
        try:
            content_len = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_len)
            payload = json.loads(raw_body)
        except Exception as e:
            self._json({"error": f"Invalid JSON payload: {e}"}, 400)
            return

        model = (payload.get("model") or "").lower()
        is_stream = bool(payload.get("stream", False))

        # Target port: Gemini (8081) or Claude (8082)
        if "gemini" in model:
            target_port = GEMINI_PORT
        elif "claude" in model:
            target_port = CLAUDE_PORT
        else:
            # Default to gemini if not specified
            target_port = GEMINI_PORT

        target_url = f"http://127.0.0.1:{target_port}/v1/chat/completions"

        try:
            req = urllib.request.Request(target_url, data=raw_body, method="POST")
            req.add_header("Content-Type", "application/json")

            resp = _direct_opener.open(req, timeout=180)
            status_code = resp.status

            if is_stream:
                self.send_response(status_code)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

                while True:
                    chunk = resp.read(512)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    self.wfile.flush()
            else:
                resp_data = resp.read()
                self.send_response(status_code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(resp_data)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            self._json({"error": f"Upstream Proxy ({target_port}) Error: {err_body}"}, e.code)
        except Exception as e:
            self._json({"error": f"Failed to connect to proxy on port {target_port}: {e}. Make sure the proxy is running."}, 502)

    def _handle_paste_cookies(self, name):
        try:
            content_len = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(content_len).decode("utf-8", errors="replace")
        except Exception:
            self._json({"success": False, "message": "Failed to read request body"}, 400)
            return

        if not raw or len(raw) < 20:
            self._json({"success": False, "message": "Empty or too short — paste the full cookie export."}, 400)
            return

        lines = raw.strip().split("\n")
        valid_lines = 0
        for line in lines:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) >= 5 and parts[4].isdigit():
                valid_lines += 1

        if valid_lines < 2:
            self._json({"success": False,
                        "message": f"Only {valid_lines} valid cookies found. Need at least 2. "
                                   f"Export using Cookie-Editor / cookies.txt extension."}, 400)
            return

        dst = GEMINI_COOKIE_FILE if name == "gemini" else CLAUDE_COOKIE_FILE
        try:
            with open(dst, "w") as f:
                f.write(raw)
            restart_res = restart_proxy(name)
            self._json({"success": True, "message": f"Saved {valid_lines} cookies & restarted {name} ({restart_res.get('message', '')})"})
        except Exception as e:
            self._json({"success": False, "message": f"Write error: {e}"}, 500)

    def _handle_cookies(self, name):
        if ON_WINDOWS:
            return {
                "success": False,
                "message": f"On Windows: export cookies from browser using Cookie-Editor extension, then use PASTE button."
            }
        script = GEMINI_COOKIE_SCRIPT if name == "gemini" else CLAUDE_COOKIE_SCRIPT
        if script and os.path.exists(script):
            try:
                subprocess.Popen(
                    ["gnome-terminal", "--hold", "--", "bash", "-c", script],
                    stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                return {"success": True, "message": f"Launched {script}"}
            except Exception as e:
                return {"success": False, "message": str(e)}
        else:
            return {
                "success": False,
                "message": f"Script not found: {script}"
            }

    def _get_status(self):
        gemini_installed = is_installed("gemini")
        claude_installed = is_installed("claude")
        vpn_alive = check_vpn()

        t0 = time.time()
        code_g, _ = http_get(f"http://127.0.0.1:{GEMINI_PORT}/v1/models", timeout=2)
        gemini_alive = (code_g == 200)
        gemini_rt = round(time.time() - t0, 3) if gemini_alive else None

        t0 = time.time()
        code_c, _ = http_get(f"http://127.0.0.1:{CLAUDE_PORT}/v1/models", timeout=2)
        claude_alive = (code_c == 200)
        claude_rt = round(time.time() - t0, 3) if claude_alive else None

        gemini_cookie = parse_cookie_expiry(GEMINI_COOKIE_FILE)
        claude_cookie = parse_cookie_expiry(CLAUDE_COOKIE_FILE)

        gemini_cookie_expiry = gemini_cookie["days"] if gemini_cookie else None
        gemini_cookie_hours = gemini_cookie["hours"] if gemini_cookie else None
        claude_cookie_expiry = claude_cookie["days"] if claude_cookie else None
        claude_cookie_hours = claude_cookie["hours"] if claude_cookie else None
        gemini_proxy = read_config("gemini")
        claude_proxy = read_config("claude")

        claude_usage = None
        if claude_alive:
            code, body = http_get(f"http://127.0.0.1:{CLAUDE_PORT}/v1/usage", timeout=3)
            if code == 200:
                try:
                    claude_usage = json.loads(body)
                except:
                    pass

        return {
            "gemini": {
                "alive": gemini_alive,
                "installed": gemini_installed,
                "port": GEMINI_PORT,
                "response_time": gemini_rt,
                "cookie_expiry_days": gemini_cookie_expiry,
                "cookie_expiry_hours": gemini_cookie_hours,
                "log_exists": os.path.exists(GEMINI_LOG),
                "proxy": gemini_proxy,
            },
            "claude": {
                "alive": claude_alive,
                "installed": claude_installed,
                "port": CLAUDE_PORT,
                "response_time": claude_rt,
                "cookie_expiry_days": claude_cookie_expiry,
                "cookie_expiry_hours": claude_cookie_hours,
                "log_exists": os.path.exists(CLAUDE_LOG),
                "proxy": claude_proxy,
                "usage": claude_usage,
            },
            "vpn": {"alive": vpn_alive, "port": VPN_PORT},
        }

    def _serve_html(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(HTML_PAGE.encode("utf-8"))

    def _json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))


# ── Full Modern Studio HTML Page ──────────────────────────────────────────

HTML_PAGE = r"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI Studio Web2API — Gemini & Claude Playground</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<!-- Markdown & Highlight.js -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark-dimmed.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

<style>
:root {
  --bg-dark: #070a13;
  --bg-sidebar: #0d121f;
  --bg-chat: #0a0e1a;
  --bg-card: rgba(19, 26, 43, 0.85);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(255, 255, 255, 0.15);
  --text-main: #f3f4f6;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --gemini-primary: #6366f1;
  --gemini-glow: rgba(99, 102, 241, 0.25);
  --claude-primary: #f97316;
  --claude-glow: rgba(249, 115, 22, 0.25);
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Plus Jakarta Sans', sans-serif;
  height: 100vh;
  overflow: hidden;
}

.studio-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}

/* ── Left Sidebar: Provider Status & Settings ── */
.sidebar {
  width: 320px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}
.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-subtle);
}
.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #f97316);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.3);
}
.brand-name { font-size: 1.1em; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
.brand-sub { font-size: 0.72em; color: var(--text-muted); font-weight: 500; }

.sidebar-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.section-label {
  font-size: 0.72em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-dim);
  margin-bottom: 4px;
}

/* Provider Mini Cards */
.provider-box {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 14px;
  transition: all 0.2s ease;
}
.provider-box:hover { border-color: var(--border-highlight); }
.provider-box.gemini { border-left: 3px solid var(--gemini-primary); }
.provider-box.claude { border-left: 3px solid var(--claude-primary); }

.box-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.box-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  font-weight: 700;
}
.box-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72em;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.dot.alive { background: var(--success); box-shadow: 0 0 8px var(--success); animation: pulse 2s infinite; }
.dot.dead { background: var(--danger); }
.dot.unknown { background: var(--warning); }
@keyframes pulse { 0%{opacity:0.8} 50%{opacity:1} 100%{opacity:0.8} }

.box-info {
  font-size: 0.75em;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.box-info span { display: flex; justify-content: space-between; }
.box-info strong { color: #cbd5e1; }

.box-btns {
  display: flex;
  gap: 6px;
}
.btn-mini {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 0.75em;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s;
}
.btn-mini:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Main Chat Area ── */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-chat);
  height: 100vh;
  position: relative;
}

/* Chat Header Control Bar */
.chat-header {
  padding: 14px 24px;
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.model-picker-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.select-model {
  background: #111827;
  color: #fff;
  border: 1px solid var(--border-subtle);
  padding: 8px 12px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85em;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  min-width: 220px;
}
.select-model:focus { border-color: var(--gemini-primary); }

.controls-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-header {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  padding: 7px 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.8em;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.btn-header:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8em;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
}
.toggle-label input { accent-color: var(--gemini-primary); cursor: pointer; }

/* Message Stream Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.messages-container::-webkit-scrollbar { width: 6px; }
.messages-container::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }

.welcome-box {
  margin: auto;
  max-width: 580px;
  text-align: center;
  padding: 36px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.welcome-icon { font-size: 2.5em; margin-bottom: 12px; }
.welcome-title { font-size: 1.3em; font-weight: 800; color: #fff; margin-bottom: 8px; }
.welcome-desc { font-size: 0.85em; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; }
.quick-prompts { display: flex; flex-direction: column; gap: 8px; text-align: left; }
.prompt-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.82em;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s;
}
.prompt-chip:hover {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
  color: #fff;
}

/* Chat Message Row */
.msg-row {
  display: flex;
  gap: 14px;
  max-width: 860px;
  width: 100%;
}
.msg-row.user {
  margin-left: auto;
  flex-direction: row-reverse;
}
.msg-row.assistant {
  margin-right: auto;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  flex-shrink: 0;
}
.msg-row.user .avatar { background: #3b82f6; }
.msg-row.assistant .avatar { background: linear-gradient(135deg, #6366f1, #ec4899); }

.bubble {
  background: #111827;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 14px 18px;
  font-size: 0.9em;
  line-height: 1.6;
  color: var(--text-main);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  max-width: 100%;
  overflow-x: auto;
}
.msg-row.user .bubble {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: #fff;
  border: none;
  border-top-right-radius: 4px;
}
.msg-row.assistant .bubble {
  border-top-left-radius: 4px;
}

/* Markdown Styling inside Bubble */
.bubble p { margin-bottom: 8px; }
.bubble p:last-child { margin-bottom: 0; }
.bubble ul, .bubble ol { margin-left: 20px; margin-bottom: 8px; }
.bubble code {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.88em;
}
.bubble pre {
  background: #090d16;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 12px;
  margin: 10px 0;
  overflow-x: auto;
  position: relative;
}
.bubble pre code { background: none; padding: 0; font-size: 0.85em; }

/* Collapsible Thinking Box */
.thinking-box {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 0.82em;
  color: #c7d2fe;
}
.thinking-box summary {
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  color: #a5b4fc;
}
.thinking-content {
  margin-top: 8px;
  white-space: pre-wrap;
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  max-height: 200px;
  overflow-y: auto;
}

/* Chat Input Bar */
.chat-footer {
  padding: 16px 28px 24px;
  background: var(--bg-sidebar);
  border-top: 1px solid var(--border-subtle);
}
.input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: #111827;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: border-color 0.2s;
}
.input-wrap:focus-within { border-color: var(--gemini-primary); }

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-family: inherit;
  font-size: 0.92em;
  line-height: 1.5;
  resize: none;
  max-height: 140px;
  outline: none;
  padding: 2px 0;
}

.send-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}
.send-btn:hover:not(:disabled) { transform: scale(1.05); filter: brightness(1.1); }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Modal Dialogs & Toasts ── */
.modal-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.modal-overlay.show { display: flex; }
.modal-card {
  background: #111827;
  border: 1px solid var(--border-highlight);
  border-radius: 16px;
  padding: 24px;
  max-width: 580px;
  width: 100%;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
  animation: pop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.modal-title { font-size: 1.15em; font-weight: 700; color: #fff; }
.btn-close { background: none; border: none; color: var(--text-muted); font-size: 1.3em; cursor: pointer; }

.tab-group { display: flex; gap: 8px; margin-bottom: 14px; }
.tab-btn {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-muted);
  font-family: inherit;
  font-weight: 600;
  font-size: 0.82em;
  cursor: pointer;
}
.tab-btn.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--gemini-primary);
  color: #fff;
}

.modal-textarea {
  width: 100%;
  height: 180px;
  background: #090d16;
  color: #fff;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78em;
  padding: 12px;
  resize: vertical;
  margin-bottom: 14px;
  outline: none;
}
.modal-textarea:focus { border-color: var(--gemini-primary); }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; }

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1e293b;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 0.85em;
  font-weight: 600;
  color: #fff;
  z-index: 9999;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast.show { opacity: 1; transform: translateY(0); }
</style>
</head>
<body>

<div class="studio-layout">
  <!-- Left Sidebar: Status, Controls & Logs -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand-icon">⚡</div>
      <div>
        <div class="brand-name">AI Studio Web2API</div>
        <div class="brand-sub">Universal Reverse-Proxy</div>
      </div>
    </div>

    <div class="sidebar-content">
      <div class="section-label">Status Provider Proxy</div>

      <!-- Gemini Mini Card -->
      <div class="provider-box gemini">
        <div class="box-top">
          <div class="box-title">🔮 Google Gemini</div>
          <div class="box-badge">
            <span class="dot unknown" id="geminiIndicator"></span>
            <span id="geminiStatus">checking...</span>
          </div>
        </div>
        <div class="box-info">
          <span>Base URL: <strong>http://localhost:8081/v1</strong></span>
          <span>Latensi: <strong id="geminiRT">--</strong></span>
          <span>Sesi Cookie: <strong id="geminiCookies">--</strong></span>
          <span>Upstream: <strong id="geminiUpstream">Direct</strong></span>
        </div>
        <div class="box-btns">
          <button class="btn-mini" onclick="doAction('gemini', 'restart')">🔄 Restart</button>
          <button class="btn-mini" onclick="openPasteModal('gemini')">📋 Paste Cookie</button>
          <button class="btn-mini" onclick="doTestHealth('gemini')">⚡ Test</button>
        </div>
      </div>

      <!-- Claude Mini Card -->
      <div class="provider-box claude">
        <div class="box-top">
          <div class="box-title">⚡ Anthropic Claude</div>
          <div class="box-badge">
            <span class="dot unknown" id="claudeIndicator"></span>
            <span id="claudeStatus">checking...</span>
          </div>
        </div>
        <div class="box-info">
          <span>Base URL: <strong>http://localhost:8082/v1</strong></span>
          <span>Latensi: <strong id="claudeRT">--</strong></span>
          <span>Sesi Cookie: <strong id="claudeCookies">--</strong></span>
          <span>Usage: <strong id="claudeUsage">--</strong></span>
        </div>
        <div class="box-btns">
          <button class="btn-mini" onclick="doAction('claude', 'restart')">🔄 Restart</button>
          <button class="btn-mini" onclick="openPasteModal('claude')">📋 Paste Cookie</button>
          <button class="btn-mini" onclick="doTestHealth('claude')">⚡ Test</button>
        </div>
      </div>

      <div class="section-label" style="margin-top:8px">Integrasi Client</div>
      <div style="font-size:0.75em;color:var(--text-muted);background:rgba(255,255,255,0.02);padding:10px;border-radius:8px;border:1px solid var(--border-subtle);line-height:1.6">
        Gunakan endpoint di atas untuk <strong>OpenCode</strong>, <strong>Continue.dev</strong>, <strong>SillyTavern</strong>, atau Chatbot Python Anda.
      </div>
    </div>

    <div class="sidebar-footer">
      <button class="btn-mini" onclick="openLogsModal()" style="padding:10px;border-radius:8px">📜 Buka Live Server Logs</button>
    </div>
  </aside>

  <!-- Main Chat Playground -->
  <main class="chat-main">
    <!-- Header Control Bar -->
    <header class="chat-header">
      <div class="controls-left">
        <div class="model-picker-wrap">
          <select id="select-model" class="select-model">
            <optgroup label="🔮 Google Gemini">
              <option value="gemini-3.5-flash" selected>Gemini 3.5 Flash (Fast & Smart)</option>
              <option value="gemini-3.5-flash-thinking">Gemini 3.5 Flash (Deep Thinking)</option>
              <option value="gemini-flash-lite">Gemini Flash Lite (Fastest)</option>
              <option value="gemini-pro">Gemini Pro (Advanced)</option>
              <option value="gemini-auto">Gemini Auto (Smart Router)</option>
            </optgroup>
            <optgroup label="⚡ Anthropic Claude">
              <option value="claude-sonnet-5">Claude Sonnet 5 (Next-Gen)</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Fast & Smart)</option>
              <option value="claude-opus-5">Claude Opus 5 (Flagship)</option>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (v2)</option>
              <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            </optgroup>
            <optgroup label="Kustom">
              <option value="custom">✏️ Ketik Model Custom Sendiri...</option>
            </optgroup>
          </select>
          <input type="text" id="input-custom-model" class="select-model" placeholder="Nama model string..." style="display:none;width:180px">
        </div>

        <button class="btn-header" id="btn-get-models" onclick="fetchAllModels()" title="Ambil daftar model aktif langsung dari proxy server">
          📥 Get Models
        </button>
      </div>

      <div class="controls-right">
        <label class="toggle-label" title="Aktifkan respons ketik real-time">
          <input type="checkbox" id="toggle-stream" checked>
          <span>Stream</span>
        </label>
        <button class="btn-header" id="btn-clear-chat" onclick="clearChat()" title="Bersihkan riwayat percakapan">
          🗑️ Clear
        </button>
      </div>
    </header>

    <!-- Message Stream -->
    <div class="messages-container" id="messages-container">
      <div class="welcome-box" id="welcome-box">
        <div class="welcome-icon">🚀</div>
        <h2 class="welcome-title">AI Studio Web2API Playground</h2>
        <p class="welcome-desc">
          Uji coba langsung percakapan dengan Google Gemini dan Claude AI via proxy lokal berstandar OpenAI.
        </p>
        <div class="quick-prompts">
          <div class="prompt-chip" onclick="sendQuickPrompt('Jelaskan cara kerja quantum computing dengan analogi sederhana.')">
            💬 "Jelaskan cara kerja quantum computing dengan analogi sederhana."
          </div>
          <div class="prompt-chip" onclick="sendQuickPrompt('Buatkan kode Python script untuk scraping web sederhana dengan BeautifulSoup.')">
            💻 "Buatkan kode Python script untuk scraping web sederhana dengan BeautifulSoup."
          </div>
          <div class="prompt-chip" onclick="sendQuickPrompt('Analisis perbedaan arsitektur model transformer vs RNN.')">
            🧠 "Analisis perbedaan arsitektur model transformer vs RNN."
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input Footer -->
    <footer class="chat-footer">
      <div class="input-wrap">
        <textarea id="chat-input" class="chat-input" rows="1" placeholder="Ketik pesan Anda di sini (Tekan Enter untuk kirim, Shift+Enter untuk baris baru)..."></textarea>
        <button id="btn-send" class="send-btn" onclick="sendMessage()">➔</button>
      </div>
    </footer>
  </main>
</div>

<!-- Modal: Paste Cookies -->
<div id="pasteModal" class="modal-overlay">
  <div class="modal-card">
    <div class="modal-header">
      <div class="modal-title">📋 Import Cookies Browser</div>
      <button class="btn-close" onclick="closePasteModal()">✕</button>
    </div>
    <div class="tab-group">
      <button class="tab-btn active" id="tab-gemini" onclick="switchPasteTab('gemini')">🔮 Google Gemini</button>
      <button class="tab-btn" id="tab-claude" onclick="switchPasteTab('claude')">⚡ Anthropic Claude</button>
    </div>
    <p style="font-size:0.8em;color:var(--text-muted);margin-bottom:10px">
      Buka <strong id="paste-domain-label">gemini.google.com</strong> &rarr; Ekspor cookie dengan ekstensi <strong>Cookie-Editor</strong> &rarr; Paste di bawah:
    </p>
    <textarea id="paste-textarea" class="modal-textarea" placeholder=".google.com	TRUE	/	FALSE	1767225600	SAPISID	..."></textarea>
    <div class="modal-footer">
      <button class="btn-header" onclick="closePasteModal()">Batal</button>
      <button class="btn-header" style="background:#6366f1;color:#fff;border:none" onclick="saveCookies()">✓ Simpan Cookie</button>
    </div>
  </div>
</div>

<!-- Modal: Live Logs -->
<div id="logsModal" class="modal-overlay">
  <div class="modal-card" style="max-width:800px">
    <div class="modal-header">
      <div class="modal-title">📜 Live Server Logs</div>
      <button class="btn-close" onclick="closeLogsModal()">✕</button>
    </div>
    <div class="tab-group">
      <button class="tab-btn active" id="logtab-gemini" onclick="switchLogTab('gemini')">🔮 Gemini (8081)</button>
      <button class="tab-btn" id="logtab-claude" onclick="switchLogTab('claude')">⚡ Claude (8082)</button>
    </div>
    <textarea id="log-display" class="modal-textarea" style="height:320px;font-size:0.75em" readonly>Memuat log...</textarea>
    <div class="modal-footer">
      <button class="btn-header" onclick="closeLogsModal()">Tutup</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
// ── State Management ──
let conversationHistory = [];
let isGenerating = false;
let currentPasteTarget = 'gemini';
let currentLogTarget = 'gemini';
let logInterval = null;

const selectModel = document.getElementById('select-model');
const inputCustomModel = document.getElementById('input-custom-model');
const toggleStream = document.getElementById('toggle-stream');
const chatInput = document.getElementById('chat-input');
const btnSend = document.getElementById('btn-send');
const messagesContainer = document.getElementById('messages-container');

selectModel.addEventListener('change', () => {
  if (selectModel.value === 'custom') {
    inputCustomModel.style.display = 'inline-block';
    inputCustomModel.focus();
  } else {
    inputCustomModel.style.display = 'none';
  }
});

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + 'px';
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = isError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';
  t.style.background = isError ? '#450a0a' : '#064e3b';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Status Polling ──
async function fetchStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    // Gemini
    const g = data.gemini || {};
    const gInd = document.getElementById('geminiIndicator');
    const gSt = document.getElementById('geminiStatus');
    const gRt = document.getElementById('geminiRT');
    const gCk = document.getElementById('geminiCookies');
    
    if (g.alive) {
      gInd.className = 'dot alive';
      gSt.textContent = 'Online';
      gSt.style.color = '#34d399';
      gRt.textContent = g.response_time ? g.response_time + 's' : '0.1s';
    } else {
      gInd.className = 'dot dead';
      gSt.textContent = 'Offline';
      gSt.style.color = '#f87171';
      gRt.textContent = '--';
    }
    if (g.cookie_expiry_days !== null && g.cookie_expiry_days !== undefined) {
      gCk.textContent = g.cookie_expiry_days + ' hari';
    } else {
      gCk.textContent = 'Aktif';
    }

    // Claude
    const c = data.claude || {};
    const cInd = document.getElementById('claudeIndicator');
    const cSt = document.getElementById('claudeStatus');
    const cRt = document.getElementById('claudeRT');
    const cCk = document.getElementById('claudeCookies');
    const cUs = document.getElementById('claudeUsage');

    if (c.alive) {
      cInd.className = 'dot alive';
      cSt.textContent = 'Online';
      cSt.style.color = '#34d399';
      cRt.textContent = c.response_time ? c.response_time + 's' : '0.1s';
    } else {
      cInd.className = 'dot dead';
      cSt.textContent = 'Offline';
      cSt.style.color = '#f87171';
      cRt.textContent = '--';
    }
    if (c.cookie_expiry_hours !== null && c.cookie_expiry_hours !== undefined) {
      cCk.textContent = '~' + Math.round(c.cookie_expiry_hours) + ' jam';
    } else {
      cCk.textContent = 'Aktif';
    }
    if (c.usage) {
      cUs.textContent = (c.usage.completions || 0) + ' msgs';
    } else {
      cUs.textContent = '--';
    }
  } catch (e) {
    console.error('Status fetch error:', e);
  }
}

// ── Fetch Models List ──
async function fetchAllModels() {
  const btn = document.getElementById('btn-get-models');
  btn.textContent = '⏳ Loading...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/models');
    const data = await res.json();
    const list = data.data || [];

    if (list.length > 0) {
      const cur = selectModel.value;
      selectModel.innerHTML = '';

      const geminiGroup = document.createElement('optgroup');
      geminiGroup.label = '🔮 Google Gemini';
      const claudeGroup = document.createElement('optgroup');
      claudeGroup.label = '⚡ Anthropic Claude';
      const otherGroup = document.createElement('optgroup');
      otherGroup.label = 'Lainnya';

      list.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name || m.id;
        if (m.provider === 'gemini' || m.id.includes('gemini')) {
          geminiGroup.appendChild(opt);
        } else if (m.provider === 'claude' || m.id.includes('claude')) {
          claudeGroup.appendChild(opt);
        } else {
          otherGroup.appendChild(opt);
        }
      });

      if (geminiGroup.children.length > 0) selectModel.appendChild(geminiGroup);
      if (claudeGroup.children.length > 0) selectModel.appendChild(claudeGroup);
      if (otherGroup.children.length > 0) selectModel.appendChild(otherGroup);

      const customGroup = document.createElement('optgroup');
      customGroup.label = 'Kustom';
      const customOpt = document.createElement('option');
      customOpt.value = 'custom';
      customOpt.textContent = '✏️ Ketik Model Custom Sendiri...';
      customGroup.appendChild(customOpt);
      selectModel.appendChild(customGroup);

      if (cur && selectModel.querySelector(`option[value="${cur}"]`)) {
        selectModel.value = cur;
      }

      btn.textContent = `✅ ${list.length} Model`;
      showToast(`Berhasil memuat ${list.length} model aktif!`);
    }
  } catch (e) {
    btn.textContent = '❌ Gagal';
    showToast('Gagal memuat model: ' + e.message, true);
  } finally {
    setTimeout(() => {
      btn.textContent = '📥 Get Models';
      btn.disabled = false;
    }, 2000);
  }
}

// ── Actions ──
async function doAction(name, act) {
  showToast(`Melakukan ${act} pada ${name}...`);
  try {
    const res = await fetch(`/api/action/${name}/${act}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`Berhasil: ${name} ${act}!`);
      setTimeout(fetchStatus, 2000);
    } else {
      showToast(`Gagal: ${data.message || 'Error'}`, true);
    }
  } catch (e) {
    showToast('Network error: ' + e.message, true);
  }
}

async function doTestHealth(name) {
  showToast(`Mengirim health test ke ${name}...`);
  try {
    const res = await fetch(`/api/test/${name}`);
    const data = await res.json();
    if (data.success) {
      showToast(`✅ ${name.toUpperCase()} Sehat (${data.time}s): "${data.response}"`);
    } else {
      showToast(`❌ ${name.toUpperCase()} Gagal: ${data.response}`, true);
    }
  } catch (e) {
    showToast('Test error: ' + e.message, true);
  }
}

// ── Modals & Cookie Management ──
function openPasteModal(target) {
  currentPasteTarget = target;
  switchPasteTab(target);
  document.getElementById('paste-textarea').value = '';
  document.getElementById('pasteModal').classList.add('show');
}
function closePasteModal() {
  document.getElementById('pasteModal').classList.remove('show');
}
function switchPasteTab(target) {
  currentPasteTarget = target;
  document.getElementById('tab-gemini').className = 'tab-btn ' + (target === 'gemini' ? 'active' : '');
  document.getElementById('tab-claude').className = 'tab-btn ' + (target === 'claude' ? 'active' : '');
  document.getElementById('paste-domain-label').textContent = target === 'gemini' ? 'gemini.google.com' : 'claude.ai';
}

async function saveCookies() {
  const text = document.getElementById('paste-textarea').value.trim();
  if (!text || text.length < 20) {
    showToast('Cookie terlalu pendek! Pastikan copy seluruh teks hasil Export.', true);
    return;
  }
  try {
    const res = await fetch(`/api/cookies/paste/${currentPasteTarget}`, {
      method: 'POST',
      body: text
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Cookie ${currentPasteTarget} berhasil disimpan!`);
      closePasteModal();
      setTimeout(fetchStatus, 1500);
    } else {
      showToast(`Gagal: ${data.message}`, true);
    }
  } catch (e) {
    showToast('Error: ' + e.message, true);
  }
}

// ── Live Logs Modal ──
function openLogsModal() {
  document.getElementById('logsModal').classList.add('show');
  fetchLogContent();
  logInterval = setInterval(fetchLogContent, 3000);
}
function closeLogsModal() {
  document.getElementById('logsModal').classList.remove('show');
  if (logInterval) clearInterval(logInterval);
}
function switchLogTab(target) {
  currentLogTarget = target;
  document.getElementById('logtab-gemini').className = 'tab-btn ' + (target === 'gemini' ? 'active' : '');
  document.getElementById('logtab-claude').className = 'tab-btn ' + (target === 'claude' ? 'active' : '');
  fetchLogContent();
}
async function fetchLogContent() {
  try {
    const res = await fetch(`/api/logs/${currentLogTarget}?lines=70`);
    const data = await res.json();
    const box = document.getElementById('log-display');
    box.value = data.log || '[Belum ada data log]';
    box.scrollTop = box.scrollHeight;
  } catch (e) {}
}

// ── Chat Functions & Streaming ──
function renderMarkdown(raw) {
  if (typeof marked !== 'undefined') {
    try {
      const html = marked.parse(raw);
      return typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html;
    } catch (e) {
      return raw;
    }
  }
  return raw;
}

function appendMessage(role, initialText = '') {
  const welcome = document.getElementById('welcome-box');
  if (welcome) welcome.style.display = 'none';

  const row = document.createElement('div');
  row.className = `msg-row ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? '👤' : (selectModel.value.includes('claude') ? '⚡' : '🔮');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  if (initialText) {
    bubble.innerHTML = renderMarkdown(initialText);
  }

  row.appendChild(avatar);
  row.appendChild(bubble);
  messagesContainer.appendChild(row);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return bubble;
}

function sendQuickPrompt(txt) {
  chatInput.value = txt;
  sendMessage();
}

function clearChat() {
  conversationHistory = [];
  messagesContainer.innerHTML = '';
  const welcome = document.getElementById('welcome-box');
  if (welcome) {
    welcome.style.display = 'block';
    messagesContainer.appendChild(welcome);
  }
  showToast('Percakapan dibersihkan!');
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isGenerating) return;

  chatInput.value = '';
  chatInput.style.height = 'auto';

  // User Bubble
  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  let model = selectModel.value;
  if (model === 'custom') {
    model = inputCustomModel.value.trim();
    if (!model) {
      showToast('Ketik nama model kustom terlebih dahulu!', true);
      return;
    }
  }
  const stream = toggleStream.checked;

  isGenerating = true;
  btnSend.disabled = true;
  btnSend.textContent = '⏳';

  const bubble = appendMessage('assistant');
  bubble.textContent = 'Menghubungi proxy...';

  let fullContent = '';
  let fullReasoning = '';
  let thinkingBox = null;
  let thinkingContent = null;
  let contentDiv = null;

  try {
    const payload = {
      model: model,
      messages: conversationHistory,
      stream: stream,
    };

    const res = await fetch('/api/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server error (${res.status})`);
    }

    if (stream) {
      bubble.textContent = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          let chunk = null;
          try {
            chunk = JSON.parse(dataStr);
          } catch (e) {
            continue;
          }

          if (chunk && chunk.error) {
            throw new Error(chunk.error.message || JSON.stringify(chunk.error));
          }

          const delta = chunk?.choices?.[0]?.delta || {};

          // Reasoning / Thinking Delta
          if (delta.reasoning_content) {
            fullReasoning += delta.reasoning_content;
            if (!thinkingBox) {
              thinkingBox = document.createElement('details');
              thinkingBox.className = 'thinking-box';
              thinkingBox.open = true;
              const summary = document.createElement('summary');
              summary.textContent = '🧠 Proses Berpikir (Reasoning)';
              thinkingContent = document.createElement('div');
              thinkingContent.className = 'thinking-content';
              thinkingBox.appendChild(summary);
              thinkingBox.appendChild(thinkingContent);
              bubble.appendChild(thinkingBox);
            }
            thinkingContent.textContent = fullReasoning;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }

          // Main text Delta
          if (delta.content) {
            fullContent += delta.content;
            if (!contentDiv) {
              contentDiv = document.createElement('div');
              bubble.appendChild(contentDiv);
            }
            contentDiv.innerHTML = renderMarkdown(fullContent);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      }

      if (!fullContent && !fullReasoning) {
        bubble.textContent = '(Tidak ada teks jawaban yang diterima)';
      }
    } else {
      const data = await res.json();
      const msg = data.choices?.[0]?.message || {};
      fullContent = msg.content || '';
      fullReasoning = msg.reasoning_content || '';

      bubble.textContent = '';
      if (fullReasoning) {
        const dt = document.createElement('details');
        dt.className = 'thinking-box';
        dt.innerHTML = `<summary>🧠 Proses Berpikir (Reasoning)</summary><div class="thinking-content">${fullReasoning}</div>`;
        bubble.appendChild(dt);
      }
      const cd = document.createElement('div');
      cd.innerHTML = renderMarkdown(fullContent);
      bubble.appendChild(cd);
    }

    conversationHistory.push({ role: 'assistant', content: fullContent });

    // Highlight code blocks
    if (typeof hljs !== 'undefined') {
      bubble.querySelectorAll('pre code').forEach(el => {
        hljs.highlightElement(el);
      });
    }
  } catch (e) {
    bubble.innerHTML = `<span style="color:#f87171;font-weight:600">⚠️ Error: ${e.message}</span>`;
  } finally {
    isGenerating = false;
    btnSend.disabled = false;
    btnSend.textContent = '➔';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// ── Initialization ──
fetchStatus();
fetchAllModels();
setInterval(fetchStatus, 15000);
</script>
</body>
</html>"""

# ── Main ──────────────────────────────────────────────────────────────────

class ThreadedPanelServer(ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True

def serve_forever(host="0.0.0.0", port=8083):
    server = None
    while True:
        try:
            if server:
                try:
                    server.server_close()
                except:
                    pass
            server = ThreadedPanelServer((host, port), PanelHandler)
            log(f"listening on http://{host}:{port}")
            log(f"open http://127.0.0.1:{port} in your browser")
            server.serve_forever()
        except KeyboardInterrupt:
            log("shutting down")
            try:
                server.shutdown()
            except:
                pass
            return
        except Exception as e:
            log(f"server crashed ({e}), restarting in 2 seconds...")
            time.sleep(2)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Proxy Control Panel")
    parser.add_argument("--port", type=int, default=PANEL_PORT, help="Panel port (default: 8083)")
    args = parser.parse_args()
    serve_forever(port=args.port)
