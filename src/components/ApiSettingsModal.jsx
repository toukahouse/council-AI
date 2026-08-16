import { useState, useEffect } from 'react';
import './ApiSettingsModal.css';

const initialModels = [
  { id: 'gemma-4-31b-it', label: 'gemma-4-31b-it' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
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
  const [maxTokens, setMaxTokens] = useState(2048);
  const [historyLimit, setHistoryLimit] = useState(14);
  const [thinkingEnabled, setThinkingEnabled] = useState(true);
  const [thinkingLevel, setThinkingLevel] = useState('high');

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

  // AI Proxy Settings
  const [aiEngine, setAiEngine] = useState('api'); // 'api', 'proxy', or 'copilot'
  const [cookiePsid, setCookiePsid] = useState('');
  const [cookiePsidts, setCookiePsidts] = useState('');
  const [browserName, setBrowserName] = useState('edge');
  const [proxyModel, setProxyModel] = useState('gemini-3-pro-plus');

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

  // Load from localStorage on mount
  useState(() => {
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
        if (parsed.maxTokens !== undefined) setMaxTokens(parsed.maxTokens);
        if (parsed.historyLimit !== undefined) setHistoryLimit(parsed.historyLimit);
        if (parsed.thinkingEnabled !== undefined) setThinkingEnabled(parsed.thinkingEnabled);
        if (parsed.thinkingLevel) setThinkingLevel(parsed.thinkingLevel);
        
        // Proxy settings load
        if (parsed.aiEngine) setAiEngine(parsed.aiEngine);
        if (parsed.cookiePsid !== undefined) setCookiePsid(parsed.cookiePsid);
        if (parsed.cookiePsidts !== undefined) setCookiePsidts(parsed.cookiePsidts);
        if (parsed.browserName !== undefined) setBrowserName(parsed.browserName);
        if (parsed.proxyModel !== undefined) setProxyModel(parsed.proxyModel);
        // Copilot settings load
        if (parsed.copilotModel !== undefined) setCopilotModel(parsed.copilotModel);
        // Gravity settings load
        if (parsed.gravityProxyUrl !== undefined) setGravityProxyUrl(parsed.gravityProxyUrl);
        if (parsed.gravityModel !== undefined) setGravityModel(parsed.gravityModel);
        if (parsed.gravityIsLoggedIn !== undefined) setGravityIsLoggedIn(parsed.gravityIsLoggedIn);
        if (parsed.gravityAccountEmail !== undefined) setGravityAccountEmail(parsed.gravityAccountEmail);
        if (parsed.gravityAvailableAccounts !== undefined) setGravityAvailableAccounts(parsed.gravityAvailableAccounts);
        
        // 9Router settings load
        if (parsed.ninerouterUrl !== undefined) setNinerouterUrl(parsed.ninerouterUrl);
        if (parsed.ninerouterApiKey !== undefined) setNinerouterApiKey(parsed.ninerouterApiKey);
        if (parsed.ninerouterModel !== undefined) setNinerouterModel(parsed.ninerouterModel);
      }
    } catch (e) {
      console.error("Error loading settings", e);
    }
  });

  // Check copilot auth status on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/copilot/auth/status')
        .then(res => res.json())
        .then(data => setCopilotAuthenticated(data.authenticated))
        .catch(() => setCopilotAuthenticated(false));
    }
  }, [isOpen]);

  // Ref to cancel polling on unmount
  const pollAbortRef = { current: false };

  const handleCopilotLogin = async () => {
    if (copilotAuthLoading) return; // Prevent double-click
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

      // Sequential polling (safer than setInterval to avoid overlapping requests)
      let waitMs = Math.max((data.interval || 5) * 1000, 6000); // At least 6 seconds to be safe

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
              waitMs += 5000; // Increase interval by 5 seconds
            } else if (pollData.error) {
              setCopilotAuthLoading(false);
              setCopilotAuthStatus(`Error: ${pollData.error}`);
              return;
            }
            // If pending, continue loop
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
      cookiePsid,
      cookiePsidts,
      browserName,
      proxyModel,
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
              
              // Hapus semua akun kecuali yang terbaru
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
          
          // Cleanup: hapus akun-akun lama jika masih ada
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
                Kelola API key, model, dan parameter generasi untuk roleplay.
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
                      className={`api-modal__btn ${aiEngine === 'api' ? 'api-modal__btn--primary' : 'api-modal__btn--ghost'}`}
                      type="button"
                      onClick={() => setAiEngine('api')}
                    >
                      Gemini API
                    </button>
                    <button
                      className={`api-modal__btn ${aiEngine === 'proxy' ? 'api-modal__btn--primary' : 'api-modal__btn--ghost'}`}
                      type="button"
                      onClick={() => setAiEngine('proxy')}
                    >
                      AI Proxy
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

                {aiEngine === 'proxy' && (
                  <>
                    <div className="api-modal__field">
                      <label className="api-modal__label" htmlFor="cookie-psid-input">GEMINI_COOKIE_1PSID</label>
                      <input
                        id="cookie-psid-input"
                        className="api-modal__input"
                        type="password"
                        placeholder="Masukkan cookie __Secure-1PSID"
                        value={cookiePsid}
                        onChange={(event) => setCookiePsid(event.target.value)}
                      />
                    </div>
                    <div className="api-modal__field">
                      <label className="api-modal__label" htmlFor="cookie-psidts-input">GEMINI_COOKIE_1PSIDTS</label>
                      <input
                        id="cookie-psidts-input"
                        className="api-modal__input"
                        type="password"
                        placeholder="Masukkan cookie __Secure-1PSIDTS"
                        value={cookiePsidts}
                        onChange={(event) => setCookiePsidts(event.target.value)}
                      />
                    </div>
                    <div className="api-modal__field">
                      <label className="api-modal__label" htmlFor="browser-name-input">BROWSER_NAME</label>
                      <input
                        id="browser-name-input"
                        className="api-modal__input"
                        type="text"
                        placeholder="Contoh: edge, chrome, firefox"
                        value={browserName}
                        onChange={(event) => setBrowserName(event.target.value)}
                      />
                    </div>
                    <div className="api-modal__field">
                      <label className="api-modal__label" htmlFor="proxy-model-input">GEMINI_MODEL</label>
                      <input
                        id="proxy-model-input"
                        className="api-modal__input"
                        type="text"
                        placeholder="Contoh: gemini-3-pro-plus"
                        value={proxyModel}
                        onChange={(event) => setProxyModel(event.target.value)}
                      />
                      <div className="api-modal__hint-block" style={{ marginTop: '8px' }}>
                        <span><strong>Model tersedia:</strong> unspecified, gemini-3-pro, gemini-3-flash, gemini-3-flash-thinking, gemini-3-pro-plus, gemini-3-flash-plus, gemini-3-flash-thinking-plus, gemini-3-pro-advanced, gemini-3-flash-advanced, gemini-3-flash-thinking-advanced</span>
                      </div>
                    </div>
                  </>
                )}

                {aiEngine === 'copilot' && (
                  <>
                    {/* Auth Status */}
                    <div className="api-modal__field">
                      <label className="api-modal__label">Status Autentikasi GitHub</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: copilotAuthenticated ? '#22c55e' : '#ef4444',
                          boxShadow: copilotAuthenticated ? '0 0 8px rgba(34,197,94,0.5)' : '0 0 8px rgba(239,68,68,0.5)',
                        }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                          {copilotAuthenticated ? 'Terautentikasi' : 'Belum login'}
                        </span>
                      </div>

                      {!copilotAuthenticated && !copilotUserCode && (
                        <button
                          className="api-modal__btn api-modal__btn--primary"
                          type="button"
                          onClick={handleCopilotLogin}
                          disabled={copilotAuthLoading}
                          style={{ width: '100%', padding: '10px', marginBottom: '8px' }}
                        >
                          {copilotAuthLoading ? 'Memproses...' : '🔗 Login with GitHub'}
                        </button>
                      )}

                      {copilotUserCode && !copilotAuthenticated && (
                        <div style={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '10px',
                          padding: '16px',
                          textAlign: 'center',
                          marginBottom: '8px'
                        }}>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                            Buka link di bawah ini dan masukkan kode berikut:
                          </p>
                          <div style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            fontFamily: 'monospace',
                            color: '#8b5cf6',
                            letterSpacing: '4px',
                            padding: '8px 0',
                            userSelect: 'all'
                          }}>
                            {copilotUserCode}
                          </div>
                          <a
                            href={copilotVerificationUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#60a5fa',
                              fontSize: '13px',
                              textDecoration: 'underline',
                              display: 'inline-block',
                              marginTop: '6px'
                            }}
                          >
                            {copilotVerificationUri}
                          </a>
                          <p style={{
                            color: '#eab308',
                            fontSize: '12px',
                            marginTop: '10px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                          }}>
                            ⏳ Menunggu otentikasi selesai...
                          </p>
                        </div>
                      )}

                      {copilotAuthenticated && (
                        <button
                          className="api-modal__btn api-modal__btn--ghost"
                          type="button"
                          onClick={handleCopilotLogout}
                          style={{ width: '100%', padding: '8px', marginBottom: '8px', color: '#ef4444' }}
                        >
                          Logout GitHub
                        </button>
                      )}

                      {copilotAuthStatus && (
                        <span className="api-modal__hint" style={{ display: 'block', marginTop: '4px' }}>
                          {copilotAuthStatus}
                        </span>
                      )}
                    </div>

                    {/* Model Selection */}
                    <div className="api-modal__field">
                      <label className="api-modal__label" htmlFor="copilot-model-input">Model AI</label>
                      <input
                        id="copilot-model-input"
                        className="api-modal__input"
                        type="text"
                        placeholder="Contoh: gpt-4o"
                        value={copilotModel}
                        onChange={(event) => setCopilotModel(event.target.value)}
                      />
                      <div className="api-modal__hint-block" style={{ marginTop: '8px' }}>
                        <span><strong>Model populer:</strong> gpt-4.1, gpt-5-mini, gpt-5.4-mini, gpt-5.2, gemini-2.5-pro, gemini-3.1-pro-preview</span>
                      </div>
                    </div>
                  </>
                )}

                {aiEngine === 'gravity' && (
                  <>
                    <div className="api-modal__field">
                      <label className="api-modal__label">Proxy URL</label>
                      <input
                        className="api-modal__input"
                        type="text"
                        placeholder="URL server Antigravity Proxy (Kosongkan jika di server yang sama)"
                        value={gravityProxyUrl}
                        onChange={(e) => setGravityProxyUrl(e.target.value)}
                      />
                    </div>
                    <div className="api-modal__field">
                      <label className="api-modal__label">Status Autentikasi Google</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{
                          display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
                          background: gravityIsLoggedIn ? '#22c55e' : '#ef4444',
                          boxShadow: gravityIsLoggedIn ? '0 0 8px rgba(34,197,94,0.5)' : '0 0 8px rgba(239,68,68,0.5)',
                        }} />
                        {gravityIsLoggedIn && gravityAvailableAccounts.length > 0 ? (
                          <div style={{ flex: 1, padding: '4px 8px', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                            {gravityAccountEmail || gravityAvailableAccounts[0]}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {gravityIsLoggedIn ? `Terhubung (${gravityAccountEmail})` : 'Belum login'}
                          </span>
                        )}
                      </div>
                      <button className="api-modal__btn api-modal__btn--primary" type="button" onClick={handleGravityLogin} style={{ width: '100%', padding: '10px', marginBottom: '8px' }}>
                        🔗 Ganti Akun Google
                      </button>
                      
                      {isGravityManualCallbackVisible && (
                        <div style={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '10px',
                          padding: '12px',
                          marginTop: '8px'
                        }}>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                            Jika muncul "ERR_CONNECTION_REFUSED" saat login (biasanya karena VPS/HP), kopi seluruh URL error di browser Anda dan paste di sini:
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              className="api-modal__input"
                              type="text"
                              placeholder="http://localhost:51121/?state=..."
                              value={gravityManualCallbackUrl}
                              onChange={(e) => setGravityManualCallbackUrl(e.target.value)}
                              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
                            />
                            <button 
                              className="api-modal__btn api-modal__btn--ghost" 
                              type="button" 
                              onClick={handleGravityManualCallback}
                              style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}
                            >
                              Kirim
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="api-modal__field">
                      <label className="api-modal__label">Koneksi Proxy</label>
                      <button className="api-modal__btn api-modal__btn--ghost" type="button" onClick={handleGravityHealthCheck} style={{ width: '100%', padding: '8px' }}>
                        🏥 Cek Koneksi Proxy
                      </button>
                      {gravityHealthResult && (
                        <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '13px' }}>
                          {gravityHealthResult}
                        </div>
                      )}
                    </div>
                    <div className="api-modal__field">
                      <label className="api-modal__label">Model AI</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                          className="api-modal__input" 
                          style={{ flex: 1, backgroundColor: '#13131a', color: '#ffffff', cursor: 'pointer', border: '1px solid rgba(124, 58, 237, 0.3)' }}
                          value={gravityModel}
                          onChange={(e) => setGravityModel(e.target.value)}
                        >
                          {gravityModels.length > 0 ? (
                            gravityModels.map(m => <option key={m} value={m} style={{ backgroundColor: '#13131a', color: '#ffffff' }}>{m}</option>)
                          ) : (
                            <>
                              <optgroup label="Claude Models">
                                <option value="claude-sonnet-4-6" style={{ backgroundColor: '#13131a', color: '#ffffff' }}>claude-sonnet-4-6</option>
                                <option value="claude-opus-4-6-thinking" style={{ backgroundColor: '#13131a', color: '#ffffff' }}>claude-opus-4-6-thinking</option>
                              </optgroup>
                              <optgroup label="Gemini Models">
                                <option value="gemini-3.5-flash-low" style={{ backgroundColor: '#13131a', color: '#ffffff' }}>gemini-3.5-flash-low</option>
                                <option value="gemini-3.1-pro-low" style={{ backgroundColor: '#13131a', color: '#ffffff' }}>gemini-3.1-pro-low</option>
                                <option value="gemini-3.1-pro-high" style={{ backgroundColor: '#13131a', color: '#ffffff' }}>gemini-3.1-pro-high</option>
                              </optgroup>
                            </>
                          )}
                        </select>
                        <button className="api-modal__btn api-modal__btn--ghost" type="button" onClick={handleGravityFetchModels} style={{ whiteSpace: 'nowrap' }}>
                          🔄 Ambil Model
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {aiEngine === '9router' && (
                  <>
                    <div className="api-modal__field">
                      <label className="api-modal__label">9Router API Endpoint</label>
                      <input
                        className="api-modal__input"
                        type="text"
                        placeholder="Contoh: https://supernova-inovategames.me/v1"
                        value={ninerouterUrl}
                        onChange={(e) => setNinerouterUrl(e.target.value)}
                      />
                    </div>
                    <div className="api-modal__field">
                      <label className="api-modal__label">API Key 9Router</label>
                      <input
                        className="api-modal__input"
                        type="password"
                        placeholder="Masukkan API Key dari dashboard 9Router"
                        value={ninerouterApiKey}
                        onChange={(e) => setNinerouterApiKey(e.target.value)}
                      />
                    </div>
                    <div className="api-modal__field">
                      <label className="api-modal__label">Nama Combo / Model</label>
                      <input
                        className="api-modal__input"
                        type="text"
                        placeholder="Contoh: cc/claude-opus-4-6 atau nama combo Anda"
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
                  <label className="api-modal__label" htmlFor="temperature-slider">Temperature (Kreativitas)</label>
                  <div className="api-modal__range">
                    <input
                      id="temperature-slider"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(event) => setTemperature(Number(event.target.value))}
                    />
                    <span className="api-modal__range-value">{temperature.toFixed(1)}</span>
                  </div>
                  <div className="api-modal__hint-block">
                    <span>0.0 - 1.0: respons logis, terstruktur, dan stabil.</span>
                    <span>1.0 - 2.0: respons kreatif, imajinatif, dan lebih beragam.</span>
                  </div>
                </div>

                <div className="api-modal__field">
                  <label className="api-modal__label" htmlFor="top-p-slider">Top P (Nucleus Sampling)</label>
                  <div className="api-modal__range">
                    <input
                      id="top-p-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={topP}
                      onChange={(event) => setTopP(Number(event.target.value))}
                    />
                    <span className="api-modal__range-value">{topP.toFixed(2)}</span>
                  </div>
                  <div className="api-modal__hint-block">
                    <span>Rekomendasi untuk roleplay: 0.9 - 0.95</span>
                  </div>
                </div>

                <div className="api-modal__field" style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="api-modal__label" htmlFor="top-k-input">Top K</label>
                    <input
                      id="top-k-input"
                      className="api-modal__input"
                      type="number"
                      min="1"
                      max="200"
                      value={topK}
                      onChange={(event) => setTopK(Number(event.target.value))}
                    />
                    <span className="api-modal__hint">Jumlah token teratas (default: 40).</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="api-modal__label" htmlFor="max-tokens-input">Panjang Maksimal</label>
                    <input
                      id="max-tokens-input"
                      className="api-modal__input"
                      type="number"
                      min="1"
                      max="65536"
                      placeholder="Rekomendasi: 2048"
                      value={maxTokens}
                      onChange={(event) => setMaxTokens(Number(event.target.value))}
                    />
                    <span className="api-modal__hint">Batas token saat ini.</span>
                  </div>
                </div>

                <div className="api-modal__field" style={{ marginTop: '12px' }}>
                  <label className="api-modal__label" htmlFor="history-limit-slider">Jumlah Riwayat Obrolan (Context History)</label>
                  <div className="api-modal__range">
                    <input
                      id="history-limit-slider"
                      type="range"
                      min="4"
                      max="40"
                      step="2"
                      value={historyLimit}
                      onChange={(event) => setHistoryLimit(Number(event.target.value))}
                    />
                    <span className="api-modal__range-value">{historyLimit} pesan</span>
                  </div>
                  <div className="api-modal__hint-block">
                    <span>Rekomendasi roleplay: 12 - 16 pesan (menjaga alur percakapan tetap fokus dan mencegah penolakan filter AI karena akumulasi teks panjang).</span>
                  </div>
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
    </>
  );
}
