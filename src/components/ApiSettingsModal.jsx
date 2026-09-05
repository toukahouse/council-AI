import { useState, useEffect } from 'react';
import './ApiSettingsModal.css';

const initialModels = [
  { id: 'gemma-4-31b-it', label: 'gemma-4-31b-it' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
];

const UNIVERSAL_MODELS = [
  // Google Gemini Models
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google',
    badge: '🌟 Rekomendasi Terkini',
    icon: '💎',
    desc: 'Model terbaru Google yang sangat cepat, pintar, dan responsif untuk roleplay.'
  },
  {
    id: 'gemini-3.5-flash-thinking',
    name: 'Gemini 3.5 Flash Thinking',
    provider: 'Google',
    badge: '🧠 Deep Reasoning',
    icon: '🔮',
    desc: 'Penalaran diperluas (Chain-of-Thought) untuk pemecahan masalah & narasi kompleks.'
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    badge: '👑 Flagship Canggih',
    icon: '⚡',
    desc: 'Penalaran tingkat tinggi untuk logika mendalam, coding, dan deskripsi detail.'
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    provider: 'Google',
    badge: '⚡ Super Cepat',
    icon: '🪶',
    desc: 'Versi teringan dengan latensi respons super instan.'
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    provider: 'Google',
    badge: '💡 Cepat & Pintar',
    icon: '✨',
    desc: 'Model serbaguna untuk percakapan sehari-hari yang seimbang.'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    badge: '🎯 Pro Mode',
    icon: '👑',
    desc: 'Alias model Gemini 3.1 Pro.'
  },
  {
    id: 'gemini-auto',
    name: 'Gemini Auto',
    provider: 'Google',
    badge: '🤖 Auto Route',
    icon: '⚙️',
    desc: 'Pemilihan model otomatis oleh sistem proxy.'
  },

  // Anthropic Claude Models
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    badge: '🌟 Rekomendasi Claude',
    icon: '🧠',
    desc: 'Model Claude terbaru yang cepat, cerdas, dan gaya bahasa naratif sangat alami.'
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    badge: '👑 Narasi & Menulis',
    icon: '🎭',
    desc: 'Penulisan roleplay, nuansa emosi karakter, dan deskripsi suasana terbaik.'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    badge: '🪶 Ringan & Gesit',
    icon: '⚡',
    desc: 'Model responsif dengan gaya bahasa yang luwes dan ekspresif.'
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    badge: '🏰 Deep Analysis',
    icon: '👑',
    desc: 'Pemahaman mendalam tentang karakter dan peran rumit.'
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    badge: '💎 Edisi Khusus',
    icon: '✨',
    desc: 'Edisi khusus cerdas untuk interaksi mendalam.'
  }
];

export default function ApiSettingsModal({ isOpen, onClose }) {
  const [activePage, setActivePage] = useState('ai');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState(initialModels);
  const [activeModelId, setActiveModelId] = useState(initialModels[0].id);
  const [newModelId, setNewModelId] = useState('');
  const [temperature, setTemperature] = useState(0.8);
  const [topP, setTopP] = useState(0.95);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(8192);
  const [historyLimit, setHistoryLimit] = useState(14);
  const [thinkingEnabled, setThinkingEnabled] = useState(true);
  const [thinkingLevel, setThinkingLevel] = useState('high');

  // AI Engine selector ('api', 'universal', 'copilot', 'gravity', '9router')
  const [aiEngine, setAiEngine] = useState('universal');

  // Universal Proxy Settings
  const [universalModel, setUniversalModel] = useState('gemini-3.7-flash');
  const [universalProxyUrl, setUniversalProxyUrl] = useState('http://127.0.0.1:8083');
  const [customUniversalModel, setCustomUniversalModel] = useState('');
  const [universalStatus, setUniversalStatus] = useState(null);
  const [isUniversalStatusLoading, setIsUniversalStatusLoading] = useState(false);
  
  // Universal Cookie Management Modal
  const [cookieModalService, setCookieModalService] = useState(null); // 'gemini' | 'claude' | null
  const [cookieInput, setCookieInput] = useState('');
  const [isSavingCookie, setIsSavingCookie] = useState(false);
  const [cookieFeedback, setCookieFeedback] = useState(null);

  // Universal Logs Viewer Modal
  const [logsModalService, setLogsModalService] = useState(null); // 'gemini' | 'claude' | null
  const [logsContent, setLogsContent] = useState('');
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Universal Health Testing
  const [testRunningService, setTestRunningService] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Universal Restarting
  const [restartingService, setRestartingService] = useState(null);
  const [restartResult, setRestartResult] = useState(null);

  // Gravity Proxy Settings
  const [gravityProxyUrl, setGravityProxyUrl] = useState('');
  const [gravityModel, setGravityModel] = useState('claude-sonnet-4-6');
  const [gravityIsLoggedIn, setGravityIsLoggedIn] = useState(false);
  const [gravityAccountEmail, setGravityAccountEmail] = useState('');
  const [gravityAvailableAccounts, setGravityAvailableAccounts] = useState([]);
  const [gravityHealthResult, setGravityHealthResult] = useState(null);
  const [gravityModels, setGravityModels] = useState([]);
  const [gravityManualCallbackUrl, setGravityManualCallbackUrl] = useState('');
  const [isGravityManualCallbackVisible, setIsGravityManualCallbackVisible] = useState(false);

  // Copilot Proxy Settings
  const [copilotModel, setCopilotModel] = useState('gpt-4o');
  const [copilotAuthenticated, setCopilotAuthenticated] = useState(false);
  const [copilotAuthLoading, setCopilotAuthLoading] = useState(false);
  const [copilotUserCode, setCopilotUserCode] = useState('');
  const [copilotVerificationUri, setCopilotVerificationUri] = useState('');
  const [copilotDeviceCode, setCopilotDeviceCode] = useState('');
  const [copilotAuthStatus, setCopilotAuthStatus] = useState('');

  // 9Router Settings
  const [ninerouterUrl, setNinerouterUrl] = useState('https://supernova-inovategames.me/v1');
  const [ninerouterApiKey, setNinerouterApiKey] = useState('');
  const [ninerouterModel, setNinerouterModel] = useState('');

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('apiSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey !== undefined) setApiKey(parsed.apiKey);
        if (parsed.models) setModels(parsed.models);
        if (parsed.activeModelId) setActiveModelId(parsed.activeModelId);
        if (parsed.temperature !== undefined) setTemperature(parsed.temperature);
        if (parsed.topP !== undefined) setTopP(parsed.topP);
        if (parsed.topK !== undefined) setTopK(parsed.topK);
        if (parsed.maxTokens !== undefined) {
          // If stored maxTokens was old low default (<= 2048), bump to 8192 for Pro reasoning headroom
          setMaxTokens(parsed.maxTokens <= 2048 ? 8192 : parsed.maxTokens);
        }
        if (parsed.historyLimit !== undefined) setHistoryLimit(parsed.historyLimit);
        if (parsed.thinkingEnabled !== undefined) setThinkingEnabled(parsed.thinkingEnabled);
        if (parsed.thinkingLevel) setThinkingLevel(parsed.thinkingLevel);
        
        // Engine selector (Migrate legacy 'puter' or 'proxy' to 'universal')
        if (parsed.aiEngine) {
          if (parsed.aiEngine === 'puter' || parsed.aiEngine === 'proxy') {
            setAiEngine('universal');
          } else {
            setAiEngine(parsed.aiEngine);
          }
        }

        // Universal proxy settings
        if (parsed.universalModel) setUniversalModel(parsed.universalModel);
        if (parsed.universalProxyUrl) setUniversalProxyUrl(parsed.universalProxyUrl);

        // Copilot settings
        if (parsed.copilotModel !== undefined) setCopilotModel(parsed.copilotModel);

        // Gravity settings
        if (parsed.gravityProxyUrl !== undefined) setGravityProxyUrl(parsed.gravityProxyUrl);
        if (parsed.gravityModel !== undefined) setGravityModel(parsed.gravityModel);
        if (parsed.gravityIsLoggedIn !== undefined) setGravityIsLoggedIn(parsed.gravityIsLoggedIn);
        if (parsed.gravityAccountEmail !== undefined) setGravityAccountEmail(parsed.gravityAccountEmail);
        if (parsed.gravityAvailableAccounts !== undefined) setGravityAvailableAccounts(parsed.gravityAvailableAccounts);
        
        // 9Router settings
        if (parsed.ninerouterUrl !== undefined) setNinerouterUrl(parsed.ninerouterUrl);
        if (parsed.ninerouterApiKey !== undefined) setNinerouterApiKey(parsed.ninerouterApiKey);
        if (parsed.ninerouterModel !== undefined) setNinerouterModel(parsed.ninerouterModel);
      }
    } catch (e) {
      console.error("Error loading settings", e);
    }
  }, []);

  // Fetch Universal Proxy Status
  const fetchUniversalStatus = async () => {
    setIsUniversalStatusLoading(true);
    try {
      const res = await fetch('/api/universal/status');
      if (res.ok) {
        const data = await res.json();
        setUniversalStatus(data);
      }
    } catch (e) {
      console.warn('Failed to fetch universal status:', e);
    } finally {
      setIsUniversalStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activePage === 'ai') {
      fetchUniversalStatus();
    }
  }, [isOpen, activePage]);

  // Check copilot auth status on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/copilot/auth/status')
        .then(res => res.json())
        .then(data => setCopilotAuthenticated(data.authenticated))
        .catch(() => setCopilotAuthenticated(false));
    }
  }, [isOpen]);

  const pollAbortRef = { current: false };

  // ==========================================
  // UNIVERSAL PROXY HANDLERS
  // ==========================================

  const handleRestartProxy = async (service) => {
    setRestartingService(service);
    setRestartResult(null);
    try {
      const res = await fetch(`/api/universal/restart/${service}`, { method: 'POST' });
      const data = await res.json();
      setRestartResult({ service, success: data.success, message: data.message });
      await fetchUniversalStatus();
    } catch (e) {
      setRestartResult({ service, success: false, message: `Gagal me-restart: ${e.message}` });
    } finally {
      setRestartingService(null);
    }
  };

  const handleTestHealth = async (service) => {
    setTestRunningService(service);
    setTestResult(null);
    try {
      const res = await fetch(`/api/universal/test/${service}`, { method: 'POST' });
      const data = await res.json();
      setTestResult({
        service,
        success: data.success,
        response: data.response,
        time: data.time
      });
      await fetchUniversalStatus();
    } catch (e) {
      setTestResult({
        service,
        success: false,
        response: `Koneksi gagal: ${e.message}`,
        time: null
      });
    } finally {
      setTestRunningService(null);
    }
  };

  const handleOpenCookieModal = (service) => {
    setCookieModalService(service);
    setCookieInput('');
    setCookieFeedback(null);
  };

  const handleSaveCookie = async () => {
    if (!cookieInput.trim()) return;
    setIsSavingCookie(true);
    setCookieFeedback(null);
    try {
      const res = await fetch(`/api/universal/cookies/${cookieModalService}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: cookieInput.trim() })
      });
      const data = await res.json();
      setCookieFeedback({
        success: data.success,
        message: data.message || (data.success ? 'Cookie berhasil diperbarui!' : 'Gagal menyimpan cookie.')
      });
      if (data.success) {
        await fetchUniversalStatus();
        setTimeout(() => {
          setCookieModalService(null);
          setCookieInput('');
          setCookieFeedback(null);
        }, 1800);
      }
    } catch (e) {
      setCookieFeedback({ success: false, message: `Error: ${e.message}` });
    } finally {
      setIsSavingCookie(false);
    }
  };

  const handleOpenLogs = async (service) => {
    setLogsModalService(service);
    setIsLogsLoading(true);
    setLogsContent('');
    try {
      const res = await fetch(`/api/universal/logs/${service}?lines=120`);
      const data = await res.json();
      setLogsContent(data.logs || 'Log kosong atau belum ada aktivitas tercatat.');
    } catch (e) {
      setLogsContent(`Gagal memuat log: ${e.message}`);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const handleApplyCustomUniversalModel = () => {
    const trimmed = customUniversalModel.trim();
    if (!trimmed) return;
    setUniversalModel(trimmed);
    setCustomUniversalModel('');
  };

  // ==========================================
  // COPILOT HANDLERS
  // ==========================================
  const handleCopilotLogin = async () => {
    if (copilotAuthLoading) return;
    setCopilotAuthLoading(true);
    setCopilotAuthStatus('Memulai proses login GitHub...');
    pollAbortRef.current = false;
    try {
      const res = await fetch('/api/copilot/auth/start', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setCopilotAuthStatus(`Error: ${data.error}`);
        setCopilotAuthLoading(false);
        return;
      }
      setCopilotUserCode(data.user_code);
      setCopilotVerificationUri(data.verification_uri);
      setCopilotDeviceCode(data.device_code);
      setCopilotAuthStatus('Masukkan kode di browser, lalu tunggu...');

      let waitMs = Math.max((data.interval || 5) * 1000, 6000);

      const poll = async () => {
        while (!pollAbortRef.current) {
          await new Promise(r => setTimeout(r, waitMs));
          if (pollAbortRef.current) break;
          try {
            const pollRes = await fetch('/api/copilot/auth/poll', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ device_code: data.device_code })
            });
            const pollData = await pollRes.json();
            if (pollData.success) {
              setCopilotAuthenticated(true);
              setCopilotAuthLoading(false);
              setCopilotAuthStatus('Login berhasil!');
              setCopilotUserCode('');
              setCopilotVerificationUri('');
              return;
            } else if (pollData.slow_down) {
              waitMs += 5000;
            } else if (pollData.error) {
              setCopilotAuthLoading(false);
              setCopilotAuthStatus(`Error: ${pollData.error}`);
              return;
            }
          } catch (e) {
            setCopilotAuthLoading(false);
            setCopilotAuthStatus('Polling gagal.');
            return;
          }
        }
      };
      poll();
    } catch (e) {
      setCopilotAuthStatus(`Error: ${e.message}`);
      setCopilotAuthLoading(false);
    }
  };

  const handleCopilotLogout = async () => {
    try {
      await fetch('/api/copilot/auth/logout', { method: 'POST' });
      setCopilotAuthenticated(false);
      setCopilotAuthStatus('Logged out.');
    } catch (e) {
      setCopilotAuthStatus('Gagal logout.');
    }
  };

  // ==========================================
  // GRAVITY HANDLERS
  // ==========================================
  const handleGravityLogin = async () => {
    try {
      const url = gravityProxyUrl ? gravityProxyUrl.replace(/\/+$/, '') : '/proxy';
      
      let initialAccounts = [];
      try {
        const initRes = await fetch(`${url}/api/accounts`);
        const initData = await initRes.json();
        if (initData.accounts) {
          initialAccounts = initData.accounts.map(a => a.email);
        }
      } catch (e) {}
      
      const res = await fetch(`${url}/api/auth/url`);
      if (!res.ok) throw new Error('Gagal mendapatkan auth URL');
      const data = await res.json();
      
      const popup = window.open(data.url, 'oauth-popup', 'width=500,height=700,left=200,top=100');
      setIsGravityManualCallbackVisible(true);
      
      const pollInterval = setInterval(async () => {
        try {
          let isClosed = false;
          try { if (!popup || popup.closed) isClosed = true; } catch(e) {}

          const accRes = await fetch(`${url}/api/accounts`);
          const accData = await accRes.json();
          const currentEmails = accData.accounts ? accData.accounts.map(a => a.email) : [];
          
          if (currentEmails.length > initialAccounts.length || isClosed) {
            clearInterval(pollInterval);
            
            if (currentEmails.length > 0) {
              const newestEmail = currentEmails[currentEmails.length - 1];
              
              for (const email of currentEmails) {
                if (email !== newestEmail) {
                  try {
                    await fetch(`${url}/api/accounts/${encodeURIComponent(email)}`, { method: 'DELETE' });
                  } catch (e) {}
                }
              }
              
              setGravityAvailableAccounts([newestEmail]);
              setGravityIsLoggedIn(true);
              setGravityAccountEmail(newestEmail);
            }
            
            try { if (popup && !isClosed) popup.close(); } catch(e) {}
          }
        } catch (e) {}
      }, 2000);
      
      setTimeout(() => clearInterval(pollInterval), 120000);
    } catch (error) {
      console.error(error);
      alert(`Login gagal: ${error.message}`);
    }
  };

  const handleGravityManualCallback = async () => {
    if (!gravityManualCallbackUrl) return;
    try {
      const url = gravityProxyUrl ? gravityProxyUrl.replace(/\/+$/, '') : '/proxy';
      
      let state = '';
      try {
        const parsedUrl = new URL(gravityManualCallbackUrl);
        state = parsedUrl.searchParams.get('state') || '';
      } catch (e) {
        throw new Error('Harap masukkan URL yang valid (mengandung parameter state)');
      }

      if (!state) throw new Error('State tidak ditemukan di URL. Pastikan Anda mengkopi seluruh URL.');

      const res = await fetch(`${url}/api/auth/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callbackInput: gravityManualCallbackUrl, state })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menyelesaikan login');
      }
      
      const accRes = await fetch(`${url}/api/accounts`);
      const accData = await accRes.json();
      if (accData.accounts && accData.accounts.length > 0) {
        const emails = accData.accounts.map(a => a.email);
        const newestEmail = emails[emails.length - 1];
        
        for (const email of emails) {
          if (email !== newestEmail) {
            try { await fetch(`${url}/api/accounts/${encodeURIComponent(email)}`, { method: 'DELETE' }); } catch (e) {}
          }
        }
        
        setGravityAvailableAccounts([newestEmail]);
        setGravityIsLoggedIn(true);
        setGravityAccountEmail(newestEmail);
        setIsGravityManualCallbackVisible(false);
        setGravityManualCallbackUrl('');
        alert('Manual login berhasil!');
      } else {
        throw new Error('Akun tidak ditemukan setelah login');
      }
    } catch (error) {
      console.error(error);
      alert(`Manual login gagal: ${error.message}`);
    }
  };

  const handleGravityHealthCheck = async () => {
    try {
      setGravityHealthResult('Memeriksa koneksi...');
      const url = gravityProxyUrl ? gravityProxyUrl.replace(/\/+$/, '') : '/proxy';
      const res = await fetch(`${url}/health`);
      if (!res.ok) throw new Error('Koneksi gagal');
      const data = await res.json();
      setGravityHealthResult(`✅ Proxy aktif (Total akun: ${data.counts?.total || 0})`);
      
      try {
        const accRes = await fetch(`${url}/api/accounts`);
        const accData = await accRes.json();
        if (accData.accounts && accData.accounts.length > 0) {
          const emails = accData.accounts.map(a => a.email);
          const newestEmail = emails[emails.length - 1];
          
          for (const email of emails) {
            if (email !== newestEmail) {
              fetch(`${url}/api/accounts/${encodeURIComponent(email)}`, { method: 'DELETE' }).catch(() => {});
            }
          }
          
          setGravityAvailableAccounts([newestEmail]);
          setGravityIsLoggedIn(true);
          setGravityAccountEmail(newestEmail);
        }
      } catch (e) {}
    } catch (error) {
      setGravityHealthResult(`❌ Error: ${error.message}`);
    }
  };

  const handleGravityFetchModels = async () => {
    try {
      const url = gravityProxyUrl ? gravityProxyUrl.replace(/\/+$/, '') : '/proxy';
      const res = await fetch(`${url}/v1/models`, { headers: { 'x-api-key': 'test' } });
      if (!res.ok) throw new Error('Gagal mengambil model');
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setGravityModels(data.data.map(m => m.id));
      }
    } catch (error) {
      console.error(error);
      alert(`Gagal mengambil model: ${error.message}`);
    }
  };

  const handleSave = () => {
    const settings = {
      apiKey,
      models,
      activeModelId,
      temperature,
      topP,
      topK,
      maxTokens,
      historyLimit,
      thinkingEnabled,
      thinkingLevel,
      aiEngine,
      universalModel,
      universalProxyUrl,
      copilotModel,
      gravityProxyUrl,
      gravityModel,
      gravityIsLoggedIn,
      gravityAccountEmail,
      gravityAvailableAccounts,
      ninerouterUrl,
      ninerouterApiKey,
      ninerouterModel
    };
    localStorage.setItem('apiSettings', JSON.stringify(settings));
    onClose();
  };

  const handleAddModel = () => {
    const trimmed = newModelId.trim();
    if (!trimmed) return;
    if (models.some((item) => item.id === trimmed)) {
      setNewModelId('');
      return;
    }
    setModels((prev) => [...prev, { id: trimmed, label: trimmed }]);
    setNewModelId('');
  };

  const handleDeleteModel = (id) => {
    setModels((prev) => prev.filter((item) => item.id !== id));
    if (activeModelId === id && models.length > 1) {
      const nextModel = models.find((item) => item.id !== id);
      if (nextModel) setActiveModelId(nextModel.id);
    }
  };

  const pages = [
    { id: 'ai', label: 'AI Settings' },
    { id: 'model', label: 'Model Settings' },
    { id: 'thinking', label: 'Thinking Settings' },
  ];

  return (
    <>
      <div
        className={`api-modal__overlay ${isOpen ? 'api-modal__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <section
        className={`api-modal ${isOpen ? 'api-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-modal-title"
      >
        <div className="api-modal__panel" onClick={(event) => event.stopPropagation()}>
          <div className="api-modal__header">
            <div>
              <span className="api-modal__eyebrow">API Settings</span>
              <h2 className="api-modal__title" id="api-modal-title">Pengaturan Model AI</h2>
              <p className="api-modal__subtitle">
                Kelola provider AI, Universal Proxy (Gemini & Claude Web2API), model pilihan, dan parameter generasi untuk roleplay.
              </p>
            </div>
            <button className="api-modal__close" onClick={onClose} type="button" aria-label="Tutup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="api-modal__tabs">
            {pages.map((page) => (
              <button
                key={page.id}
                className={`api-modal__tab ${activePage === page.id ? 'api-modal__tab--active' : ''}`}
                onClick={() => setActivePage(page.id)}
                type="button"
              >
                {page.label}
              </button>
            ))}
          </div>

          <div className="api-modal__content">
            {activePage === 'ai' && (
              <div className="api-modal__section">
                
                <div className="api-modal__field api-modal__field--row">
                  <label className="api-modal__label">AI Engine</label>
                  <div className="api-modal__engine-toggle">
                    <button
                      className={`api-modal__btn ${aiEngine === 'universal' ? 'api-modal__btn--primary' : 'api-modal__btn--ghost'}`}
                      type="button"
                      onClick={() => setAiEngine('universal')}
                    >
                      Universal Proxy
                    </button>
                    <button
                      className={`api-modal__btn ${aiEngine === 'api' ? 'api-modal__btn--primary' : 'api-modal__btn--ghost'}`}
                      type="button"
                      onClick={() => setAiEngine('api')}
                    >
                      Gemini API
                    </button>
                    <button
                      className={`api-modal__btn ${aiEngine === 'copilot' ? 'api-modal__btn--primary' : 'api-modal__btn--ghost'}`}
                      type="button"
                      onClick={() => setAiEngine('copilot')}
                    >
                      Copilot Proxy
                    </button>
                    <button
                      className={`api-modal__btn ${aiEngine === 'gravity' ? 'api-modal__btn--primary' : 'api-modal__btn--ghost'}`}
                      type="button"
                      onClick={() => setAiEngine('gravity')}
                    >
                      Gravity Proxy
                    </button>
                    <button
                      className={`api-modal__btn ${aiEngine === '9router' ? 'api-modal__btn--primary' : 'api-modal__btn--ghost'}`}
                      type="button"
                      onClick={() => setAiEngine('9router')}
                    >
                      9Router
                    </button>
                  </div>
                </div>

                {/* ========================================== */}
                {/* UNIVERSAL PROXY ENGINE (GEMINI & CLAUDE) */}
                {/* ========================================== */}
                {aiEngine === 'universal' && (
                  <div className="universal-proxy-container">
                    
                    {/* Status Feedback / Notifications */}
                    {testResult && (
                      <div className={`universal-alert ${testResult.success ? 'universal-alert--success' : 'universal-alert--error'}`}>
                        <div className="universal-alert__header">
                          <span>{testResult.success ? '✅ Tes Kesehatan Berhasil' : '❌ Tes Kesehatan Gagal'} ({testResult.service.toUpperCase()})</span>
                          {testResult.time && <span className="universal-alert__time">{testResult.time}s</span>}
                        </div>
                        <p className="universal-alert__text">{testResult.response}</p>
                      </div>
                    )}

                    {restartResult && (
                      <div className={`universal-alert ${restartResult.success ? 'universal-alert--success' : 'universal-alert--error'}`}>
                        <span>{restartResult.success ? '🔄 ' : '⚠️ '}{restartResult.message}</span>
                      </div>
                    )}

                    {/* Services Live Status Cards */}
                    <div className="universal-status-grid">
                      {/* Gemini Proxy Card */}
                      <div className={`universal-card ${universalStatus?.gemini?.alive ? 'universal-card--online' : 'universal-card--offline'}`}>
                        <div className="universal-card__header">
                          <div className="universal-card__title">
                            <span className="universal-card__brand-icon">💎</span>
                            <div>
                              <h4>Google Gemini Proxy</h4>
                              <span className="universal-card__port">Port: 8081</span>
                            </div>
                          </div>
                          <div className="universal-card__badge-wrapper">
                            <span className={`universal-status-pill ${universalStatus?.gemini?.alive ? 'universal-status-pill--online' : 'universal-status-pill--offline'}`}>
                              <span className="universal-dot" />
                              {universalStatus?.gemini?.alive ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>

                        <div className="universal-card__meta">
                          <div className="universal-meta-row">
                            <span className="universal-meta-label">Status Cookie:</span>
                            <span className={`universal-meta-val ${universalStatus?.gemini?.cookie_expiry_days ? 'universal-meta-val--ok' : 'universal-meta-val--warn'}`}>
                              {universalStatus?.gemini?.cookie_expiry_days
                                ? `Aktif (${universalStatus.gemini.cookie_expiry_days} hari)`
                                : (universalStatus?.gemini?.cookie_exists ? 'Cookie Tersimpan' : 'Belum Ada Cookie')}
                            </span>
                          </div>
                        </div>

                        <div className="universal-card__actions">
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--test"
                            onClick={() => handleTestHealth('gemini')}
                            disabled={testRunningService === 'gemini'}
                            title="Tes chat respons"
                          >
                            {testRunningService === 'gemini' ? '⏳ Menguji...' : '⚡ Test Health'}
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--cookie"
                            onClick={() => handleOpenCookieModal('gemini')}
                            title="Update Cookie Firefox"
                          >
                            🍪 Update Cookie
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--restart"
                            onClick={() => handleRestartProxy('gemini')}
                            disabled={restartingService === 'gemini'}
                            title="Restart service proxy"
                          >
                            {restartingService === 'gemini' ? '🔄...' : '🔄 Restart'}
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--logs"
                            onClick={() => handleOpenLogs('gemini')}
                            title="Lihat Log Server"
                          >
                            📜 Logs
                          </button>
                        </div>
                      </div>

                      {/* Claude Proxy Card */}
                      <div className={`universal-card ${universalStatus?.claude?.alive ? 'universal-card--online' : 'universal-card--offline'}`}>
                        <div className="universal-card__header">
                          <div className="universal-card__title">
                            <span className="universal-card__brand-icon">🧠</span>
                            <div>
                              <h4>Anthropic Claude Proxy</h4>
                              <span className="universal-card__port">Port: 8082</span>
                            </div>
                          </div>
                          <div className="universal-card__badge-wrapper">
                            <span className={`universal-status-pill ${universalStatus?.claude?.alive ? 'universal-status-pill--online' : 'universal-status-pill--offline'}`}>
                              <span className="universal-dot" />
                              {universalStatus?.claude?.alive ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>

                        <div className="universal-card__meta">
                          <div className="universal-meta-row">
                            <span className="universal-meta-label">Status Cookie:</span>
                            <span className={`universal-meta-val ${universalStatus?.claude?.cookie_expiry_days ? 'universal-meta-val--ok' : 'universal-meta-val--warn'}`}>
                              {universalStatus?.claude?.cookie_expiry_days
                                ? `Aktif (${universalStatus.claude.cookie_expiry_days} hari)`
                                : (universalStatus?.claude?.cookie_exists ? 'Cookie Tersimpan' : 'Belum Ada Cookie')}
                            </span>
                          </div>
                          {universalStatus?.claude?.usage && (
                            <div className="universal-meta-row">
                              <span className="universal-meta-label">Completions:</span>
                              <span className="universal-meta-val">{universalStatus.claude.usage.completions || 0} reqs</span>
                            </div>
                          )}
                        </div>

                        <div className="universal-card__actions">
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--test"
                            onClick={() => handleTestHealth('claude')}
                            disabled={testRunningService === 'claude'}
                            title="Tes chat respons"
                          >
                            {testRunningService === 'claude' ? '⏳ Menguji...' : '⚡ Test Health'}
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--cookie"
                            onClick={() => handleOpenCookieModal('claude')}
                            title="Update Cookie Claude"
                          >
                            🍪 Update Cookie
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--restart"
                            onClick={() => handleRestartProxy('claude')}
                            disabled={restartingService === 'claude'}
                            title="Restart service proxy"
                          >
                            {restartingService === 'claude' ? '🔄...' : '🔄 Restart'}
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--logs"
                            onClick={() => handleOpenLogs('claude')}
                            title="Lihat Log Server"
                          >
                            📜 Logs
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Model Selection Group */}
                    <div className="api-modal__field">
                      <div className="universal-section-header">
                        <label className="api-modal__label">Pilihan Model AI Universal (Web Reverse Proxy)</label>
                        <button
                          type="button"
                          className="universal-refresh-status-btn"
                          onClick={fetchUniversalStatus}
                          disabled={isUniversalStatusLoading}
                          title="Refresh status proxy"
                        >
                          {isUniversalStatusLoading ? '🔄 Memeriksa...' : '🔄 Cek Status Proxy'}
                        </button>
                      </div>

                      {/* Google Gemini Models Category */}
                      <div className="universal-model-category">
                        <div className="universal-model-category__title">
                          <span>💎</span> Google Gemini (Free Web Proxy)
                        </div>
                        <div className="universal-model-grid">
                          {UNIVERSAL_MODELS.filter(m => m.provider === 'Google').map(m => {
                            const isSelected = universalModel === m.id;
                            return (
                              <div
                                key={m.id}
                                className={`universal-model-card ${isSelected ? 'universal-model-card--selected' : ''}`}
                                onClick={() => setUniversalModel(m.id)}
                              >
                                <div className="universal-model-card__top">
                                  <div className="universal-model-card__name-wrapper">
                                    <span className="universal-model-card__icon">{m.icon}</span>
                                    <span className="universal-model-card__name">{m.name}</span>
                                  </div>
                                  <span className="universal-model-card__badge">{m.badge}</span>
                                </div>
                                <div className="universal-model-card__id">{m.id}</div>
                                <div className="universal-model-card__desc">{m.desc}</div>
                                <div className="universal-model-card__footer">
                                  <span className={`universal-radio-indicator ${isSelected ? 'universal-radio-indicator--selected' : ''}`} />
                                  <span className="universal-model-card__select-text">
                                    {isSelected ? 'Model Aktif' : 'Gunakan Model'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Anthropic Claude Models Category */}
                      <div className="universal-model-category">
                        <div className="universal-model-category__title">
                          <span>🧠</span> Anthropic Claude (Free Web Proxy)
                        </div>
                        <div className="universal-model-grid">
                          {UNIVERSAL_MODELS.filter(m => m.provider === 'Anthropic').map(m => {
                            const isSelected = universalModel === m.id;
                            return (
                              <div
                                key={m.id}
                                className={`universal-model-card ${isSelected ? 'universal-model-card--selected' : ''}`}
                                onClick={() => setUniversalModel(m.id)}
                              >
                                <div className="universal-model-card__top">
                                  <div className="universal-model-card__name-wrapper">
                                    <span className="universal-model-card__icon">{m.icon}</span>
                                    <span className="universal-model-card__name">{m.name}</span>
                                  </div>
                                  <span className="universal-model-card__badge">{m.badge}</span>
                                </div>
                                <div className="universal-model-card__id">{m.id}</div>
                                <div className="universal-model-card__desc">{m.desc}</div>
                                <div className="universal-model-card__footer">
                                  <span className={`universal-radio-indicator ${isSelected ? 'universal-radio-indicator--selected' : ''}`} />
                                  <span className="universal-model-card__select-text">
                                    {isSelected ? 'Model Aktif' : 'Gunakan Model'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Model ID Input */}
                      <div className="universal-custom-model-row">
                        <input
                          type="text"
                          className="api-modal__input"
                          placeholder="Atau masukkan Model ID custom (contoh: gemini-3.7-flash, claude-haiku-4-5-20251001)..."
                          value={customUniversalModel}
                          onChange={(e) => setCustomUniversalModel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCustomUniversalModel();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="api-modal__btn api-modal__btn--ghost"
                          onClick={handleApplyCustomUniversalModel}
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>

                    {/* Advanced Configuration (Proxy URL) */}
                    <div className="universal-advanced-box">
                      <div className="universal-advanced-header">
                        <span className="universal-advanced-icon">⚙️</span>
                        <span>Konfigurasi Endpoint Universal Proxy</span>
                      </div>
                      <div className="api-modal__field" style={{ marginTop: '8px' }}>
                        <input
                          type="text"
                          className="api-modal__input"
                          placeholder="http://127.0.0.1:8083"
                          value={universalProxyUrl}
                          onChange={(e) => setUniversalProxyUrl(e.target.value)}
                        />
                        <span className="api-modal__hint">
                          Default: <code>http://127.0.0.1:8083</code> (Universal Control Panel Router). Semua request akan di-route secara otomatis ke Gemini (8081) atau Claude (8082).
                        </span>
                      </div>
                    </div>

                  </div>
                )}

                {/* Gemini API Engine */}
                {aiEngine === 'api' && (
                  <>
                    <div className="api-modal__field">
                      <label className="api-modal__label" htmlFor="api-key-input">API Key</label>
                      <input
                        id="api-key-input"
                        className="api-modal__input"
                        type="password"
                        placeholder="Masukkan API key kamu"
                        value={apiKey}
                        onChange={(event) => setApiKey(event.target.value)}
                      />
                      <span className="api-modal__hint">API key disimpan lokal untuk menjalankan model.</span>
                    </div>

                    <div className="api-modal__field">
                      <label className="api-modal__label">Model AI</label>
                      <div className="api-modal__models">
                        {models.map((model) => (
                          <div
                            key={model.id}
                            className={`api-model ${activeModelId === model.id ? 'api-model--active' : ''}`}
                          >
                            <button
                              className="api-model__select"
                              type="button"
                              onClick={() => setActiveModelId(model.id)}
                            >
                              <span className="api-model__radio" />
                              <span className="api-model__name">{model.label}</span>
                            </button>
                            <button
                              className="api-model__delete"
                              type="button"
                              onClick={() => handleDeleteModel(model.id)}
                              aria-label={`Hapus model ${model.label}`}
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="api-modal__add">
                        <input
                          className="api-modal__input"
                          type="text"
                          placeholder="Tambah model baru, contoh: gpt-4o-mini"
                          value={newModelId}
                          onChange={(event) => setNewModelId(event.target.value)}
                        />
                        <button className="api-modal__btn api-modal__btn--ghost" type="button" onClick={handleAddModel}>
                          Tambah Model
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Copilot Engine */}
                {aiEngine === 'copilot' && (
                  <>
                    <div className="api-modal__field">
                      <label className="api-modal__label">Status Autentikasi GitHub</label>
                      <div className="copilot-auth-card">
                        <div className="copilot-auth-status">
                          <span className={`copilot-status-dot ${copilotAuthenticated ? 'copilot-status-dot--active' : ''}`} />
                          <span className="copilot-status-text">
                            {copilotAuthenticated ? 'Terhubung dengan GitHub Copilot' : 'Belum Terautentikasi'}
                          </span>
                        </div>
                        {copilotAuthenticated ? (
                          <button
                            type="button"
                            className="api-modal__btn api-modal__btn--danger"
                            onClick={handleCopilotLogout}
                          >
                            Logout GitHub
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="api-modal__btn api-modal__btn--primary"
                            onClick={handleCopilotLogin}
                            disabled={copilotAuthLoading}
                          >
                            {copilotAuthLoading ? 'Memproses...' : 'Login dengan GitHub'}
                          </button>
                        )}
                      </div>
                      {copilotAuthStatus && (
                        <div className="copilot-auth-message">{copilotAuthStatus}</div>
                      )}
                      {copilotUserCode && copilotVerificationUri && (
                        <div className="copilot-device-code-box">
                          <p>Buka tautan verifikasi dan masukkan kode berikut:</p>
                          <div className="copilot-code-display">
                            <code>{copilotUserCode}</code>
                            <button
                              type="button"
                              className="api-modal__btn api-modal__btn--ghost api-modal__btn--small"
                              onClick={() => navigator.clipboard.writeText(copilotUserCode)}
                            >
                              Salin Kode
                            </button>
                          </div>
                          <a
                            href={copilotVerificationUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="copilot-verify-link"
                          >
                            Buka Halaman Verifikasi GitHub →
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="api-modal__field">
                      <label className="api-modal__label">Pilihan Model Copilot</label>
                      <div className="copilot-models-grid">
                        {[
                          { id: 'gpt-4o', name: 'GPT-4o', desc: 'Flagship smart model' },
                          { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Powerful reasoning & roleplay' },
                          { id: 'o1-mini', name: 'o1-mini', desc: 'Reasoning model' },
                          { id: 'o1', name: 'o1', desc: 'Full reasoning powerhouse' }
                        ].map((m) => (
                          <div
                            key={m.id}
                            className={`copilot-model-card ${copilotModel === m.id ? 'copilot-model-card--active' : ''}`}
                            onClick={() => setCopilotModel(m.id)}
                          >
                            <div className="copilot-model-name">{m.name}</div>
                            <div className="copilot-model-desc">{m.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Gravity Engine */}
                {aiEngine === 'gravity' && (
                  <>
                    <div className="api-modal__field">
                      <label className="api-modal__label">Akun Antigravity</label>
                      <div className="copilot-auth-card">
                        <div className="copilot-auth-status">
                          <span className={`copilot-status-dot ${gravityIsLoggedIn ? 'copilot-status-dot--active' : ''}`} />
                          <span className="copilot-status-text">
                            {gravityIsLoggedIn ? `Login: ${gravityAccountEmail}` : 'Belum Login Akun'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="api-modal__btn api-modal__btn--primary"
                          onClick={handleGravityLogin}
                        >
                          {gravityIsLoggedIn ? 'Ganti / Re-Login Akun' : 'Login Akun Antigravity'}
                        </button>
                      </div>

                      {isGravityManualCallbackVisible && (
                        <div className="gravity-manual-callback-box">
                          <p>Jika login otomatis tidak merespons, paste URL callback di sini:</p>
                          <input
                            type="text"
                            className="api-modal__input"
                            placeholder="Paste full URL callback (http://localhost:8080/callback?...)"
                            value={gravityManualCallbackUrl}
                            onChange={(e) => setGravityManualCallbackUrl(e.target.value)}
                          />
                          <button
                            type="button"
                            className="api-modal__btn api-modal__btn--primary"
                            onClick={handleGravityManualCallback}
                          >
                            Selesaikan Login Manual
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="api-modal__field">
                      <div className="gravity-health-row">
                        <label className="api-modal__label" style={{ marginBottom: 0 }}>Cek Status Server</label>
                        <button
                          type="button"
                          className="api-modal__btn api-modal__btn--ghost api-modal__btn--small"
                          onClick={handleGravityHealthCheck}
                        >
                          Cek Koneksi
                        </button>
                      </div>
                      {gravityHealthResult && (
                        <div className="copilot-auth-message">{gravityHealthResult}</div>
                      )}
                    </div>

                    <div className="api-modal__field">
                      <label className="api-modal__label">Model Gravity</label>
                      <div className="copilot-models-grid">
                        {[
                          { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', desc: 'Flagship Claude' },
                          { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: 'Fast & Versatile' },
                          { id: 'gpt-4o', name: 'GPT-4o', desc: 'OpenAI Flagship' }
                        ].map((m) => (
                          <div
                            key={m.id}
                            className={`copilot-model-card ${gravityModel === m.id ? 'copilot-model-card--active' : ''}`}
                            onClick={() => setGravityModel(m.id)}
                          >
                            <div className="copilot-model-name">{m.name}</div>
                            <div className="copilot-model-desc">{m.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 9Router Engine */}
                {aiEngine === '9router' && (
                  <>
                    <div className="api-modal__field">
                      <label className="api-modal__label">9Router URL</label>
                      <input
                        type="text"
                        className="api-modal__input"
                        placeholder="https://supernova-inovategames.me/v1"
                        value={ninerouterUrl}
                        onChange={(e) => setNinerouterUrl(e.target.value)}
                      />
                    </div>

                    <div className="api-modal__field">
                      <label className="api-modal__label">9Router API Key</label>
                      <input
                        type="password"
                        className="api-modal__input"
                        placeholder="Masukkan API key 9Router (jika ada)"
                        value={ninerouterApiKey}
                        onChange={(e) => setNinerouterApiKey(e.target.value)}
                      />
                    </div>

                    <div className="api-modal__field">
                      <label className="api-modal__label">Model 9Router</label>
                      <input
                        type="text"
                        className="api-modal__input"
                        placeholder="gemini-3-pro-plus"
                        value={ninerouterModel}
                        onChange={(e) => setNinerouterModel(e.target.value)}
                      />
                    </div>
                  </>
                )}

              </div>
            )}

            {activePage === 'model' && (
              <div className="api-modal__section">
                <div className="api-modal__field">
                  <div className="api-modal__field-header">
                    <label className="api-modal__label">Temperature: {temperature}</label>
                    <span className="api-modal__hint">Mengontrol kreativitas respon (0 = fokus, 1 = sangat kreatif).</span>
                  </div>
                  <input
                    className="api-modal__slider"
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={temperature}
                    onChange={(event) => setTemperature(parseFloat(event.target.value))}
                  />
                </div>

                <div className="api-modal__field">
                  <div className="api-modal__field-header">
                    <label className="api-modal__label">Top P: {topP}</label>
                    <span className="api-modal__hint">Nucleus sampling (0.1 - 1.0).</span>
                  </div>
                  <input
                    className="api-modal__slider"
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(event) => setTopP(parseFloat(event.target.value))}
                  />
                </div>

                <div className="api-modal__field">
                  <div className="api-modal__field-header">
                    <label className="api-modal__label">Top K: {topK}</label>
                    <span className="api-modal__hint">Batasan jumlah kata yang dipertimbangkan.</span>
                  </div>
                  <input
                    className="api-modal__slider"
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={topK}
                    onChange={(event) => setTopK(parseInt(event.target.value))}
                  />
                </div>

                <div className="api-modal__field">
                  <div className="api-modal__field-header">
                    <label className="api-modal__label">Max Output Tokens: {maxTokens}</label>
                    <span className="api-modal__hint">Panjang maksimum respon yang dihasilkan.</span>
                  </div>
                  <input
                    className="api-modal__slider"
                    type="range"
                    min="512"
                    max="16384"
                    step="256"
                    value={maxTokens}
                    onChange={(event) => setMaxTokens(parseInt(event.target.value))}
                  />
                </div>

                <div className="api-modal__field">
                  <div className="api-modal__field-header">
                    <label className="api-modal__label">History Limit: {historyLimit} Pesan</label>
                    <span className="api-modal__hint">Jumlah pesan sebelumnya yang dikirim ke AI sebagai konteks memori.</span>
                  </div>
                  <input
                    className="api-modal__slider"
                    type="range"
                    min="4"
                    max="60"
                    step="2"
                    value={historyLimit}
                    onChange={(event) => setHistoryLimit(parseInt(event.target.value))}
                  />
                </div>
              </div>
            )}

            {activePage === 'thinking' && (
              <div className="api-modal__section">
                <div className="api-modal__field api-modal__field--row">
                  <div>
                    <label className="api-modal__label">Thinking Mode</label>
                    <span className="api-modal__hint">Aktifkan untuk menampilkan reasoning model.</span>
                  </div>
                  <button
                    className={`api-modal__toggle ${thinkingEnabled ? 'api-modal__toggle--on' : ''}`}
                    type="button"
                    onClick={() => setThinkingEnabled((prev) => !prev)}
                    aria-pressed={thinkingEnabled}
                  >
                    <span className="api-modal__toggle-dot" />
                  </button>
                </div>

                <div className="api-modal__field">
                  <label className="api-modal__label">Thinking Level</label>
                  <div className={`api-modal__levels ${!thinkingEnabled ? 'api-modal__levels--disabled' : ''}`}>
                    <label className="api-modal__level">
                      <input
                        type="radio"
                        name="thinking-level"
                        value="minimal"
                        checked={thinkingLevel === 'minimal'}
                        onChange={() => setThinkingLevel('minimal')}
                        disabled={!thinkingEnabled}
                      />
                      <span>MINIMAL</span>
                    </label>
                    <label className="api-modal__level">
                      <input
                        type="radio"
                        name="thinking-level"
                        value="high"
                        checked={thinkingLevel === 'high'}
                        onChange={() => setThinkingLevel('high')}
                        disabled={!thinkingEnabled}
                      />
                      <span>HIGH</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="api-modal__footer">
            <span className="api-modal__footer-note">Perubahan berlaku setelah disimpan.</span>
            <div className="api-modal__actions">
              <button className="api-modal__btn api-modal__btn--ghost" type="button" onClick={onClose}>
                Batal
              </button>
              <button className="api-modal__btn api-modal__btn--primary" type="button" onClick={handleSave}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* MODAL: PASTE COOKIE MANAGEMENT */}
      {/* ========================================== */}
      {cookieModalService && (
        <div className="universal-submodal__overlay" onClick={() => setCookieModalService(null)}>
          <div className="universal-submodal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="universal-submodal__header">
              <div className="universal-submodal__title">
                <span>🍪</span> Update Cookie {cookieModalService === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}
              </div>
              <button
                type="button"
                className="universal-submodal__close"
                onClick={() => setCookieModalService(null)}
              >
                ✕
              </button>
            </div>

            <div className="universal-submodal__body">
              <div className="universal-guide-box">
                <h5>Panduan Ekspor Cookie:</h5>
                <ol>
                  <li>Buka browser (Firefox/Chrome) dan login ke akun <strong>{cookieModalService === 'gemini' ? 'gemini.google.com' : 'claude.ai'}</strong>.</li>
                  <li>Gunakan ekstensi <strong>Cookie-Editor</strong> atau <strong>cookies.txt</strong>.</li>
                  <li>Klik <strong>Export</strong> (format Netscape / Text).</li>
                  <li>Paste teks cookie lengkap ke dalam kotak di bawah lalu klik Simpan.</li>
                </ol>
              </div>

              {cookieFeedback && (
                <div className={`universal-alert ${cookieFeedback.success ? 'universal-alert--success' : 'universal-alert--error'}`}>
                  <span>{cookieFeedback.message}</span>
                </div>
              )}

              <textarea
                className="universal-cookie-textarea"
                placeholder={`Paste konten cookie ${cookieModalService === 'gemini' ? 'cookie.txt' : 'cookie_claude.txt'} di sini...`}
                value={cookieInput}
                onChange={(e) => setCookieInput(e.target.value)}
                rows={10}
                autoFocus
              />
            </div>

            <div className="universal-submodal__footer">
              <button
                type="button"
                className="api-modal__btn api-modal__btn--ghost"
                onClick={() => setCookieModalService(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="api-modal__btn api-modal__btn--primary"
                onClick={handleSaveCookie}
                disabled={isSavingCookie || !cookieInput.trim()}
              >
                {isSavingCookie ? 'Menyimpan & Me-restart...' : 'Simpan & Restart Proxy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: LIVE LOGS VIEWER */}
      {/* ========================================== */}
      {logsModalService && (
        <div className="universal-submodal__overlay" onClick={() => setLogsModalService(null)}>
          <div className="universal-submodal__panel universal-submodal__panel--wide" onClick={(e) => e.stopPropagation()}>
            <div className="universal-submodal__header">
              <div className="universal-submodal__title">
                <span>📜</span> Log Server Proxy: {logsModalService.toUpperCase()}
              </div>
              <div className="universal-submodal__header-actions">
                <button
                  type="button"
                  className="universal-action-btn universal-action-btn--test"
                  onClick={() => handleOpenLogs(logsModalService)}
                  disabled={isLogsLoading}
                >
                  {isLogsLoading ? 'Memuat...' : '🔄 Refresh Log'}
                </button>
                <button
                  type="button"
                  className="universal-submodal__close"
                  onClick={() => setLogsModalService(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="universal-submodal__body">
              <pre className="universal-logs-viewer">
                {isLogsLoading ? 'Memuat baris log terbaru...' : logsContent}
              </pre>
            </div>

            <div className="universal-submodal__footer">
              <button
                type="button"
                className="api-modal__btn api-modal__btn--ghost"
                onClick={() => setLogsModalService(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
