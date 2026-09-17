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

const DEFAULT_NINEROUTER_COMBOS = [
  'gemini-3-pro-plus',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'claude-3-7-sonnet',
  'claude-3-5-sonnet',
  'deepseek-r1'
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

  // AI Engine selector ('api', 'universal', '9router')
  const [aiEngine, setAiEngine] = useState('9router');

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

  // 9Router Settings
  const [ninerouterUrl, setNinerouterUrl] = useState('https://supernova-inovategames.me/v1');
  const [ninerouterApiKey, setNinerouterApiKey] = useState('');
  const [ninerouterModel, setNinerouterModel] = useState('gemini-3-pro-plus');
  const [ninerouterCombos, setNinerouterCombos] = useState(DEFAULT_NINEROUTER_COMBOS);
  const [newComboInput, setNewComboInput] = useState('');

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
        
        // Engine selector (Migrate legacy 'copilot' / 'gravity' / 'puter' / 'proxy' to '9router' or 'universal')
        if (parsed.aiEngine) {
          if (parsed.aiEngine === 'copilot' || parsed.aiEngine === 'gravity') {
            setAiEngine('9router');
          } else if (parsed.aiEngine === 'puter' || parsed.aiEngine === 'proxy') {
            setAiEngine('universal');
          } else {
            setAiEngine(parsed.aiEngine);
          }
        }

        // Universal proxy settings
        if (parsed.universalModel) setUniversalModel(parsed.universalModel);
        if (parsed.universalProxyUrl) setUniversalProxyUrl(parsed.universalProxyUrl);

        // 9Router settings
        if (parsed.ninerouterUrl !== undefined) setNinerouterUrl(parsed.ninerouterUrl);
        if (parsed.ninerouterApiKey !== undefined) setNinerouterApiKey(parsed.ninerouterApiKey);
        if (parsed.ninerouterModel !== undefined) setNinerouterModel(parsed.ninerouterModel);
        if (parsed.ninerouterCombos && Array.isArray(parsed.ninerouterCombos) && parsed.ninerouterCombos.length > 0) {
          setNinerouterCombos(parsed.ninerouterCombos);
        }
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
  // 9ROUTER COMBO HANDLERS
  // ==========================================
  const handleAddNinerouterCombo = (e) => {
    if (e) e.preventDefault();
    const trimmed = newComboInput.trim();
    if (!trimmed) return;
    if (!ninerouterCombos.includes(trimmed)) {
      const updated = [...ninerouterCombos, trimmed];
      setNinerouterCombos(updated);
      setNinerouterModel(trimmed);
    } else {
      setNinerouterModel(trimmed);
    }
    setNewComboInput('');
  };

  const handleDeleteNinerouterCombo = (comboToDelete, e) => {
    if (e) e.stopPropagation();
    const updated = ninerouterCombos.filter((c) => c !== comboToDelete);
    setNinerouterCombos(updated);
    if (ninerouterModel === comboToDelete) {
      setNinerouterModel(updated[0] || '');
    }
  };

  const handleSelectNinerouterCombo = (combo) => {
    setNinerouterModel(combo);
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
      ninerouterUrl,
      ninerouterApiKey,
      ninerouterModel,
      ninerouterCombos
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
    { id: 'ai', label: 'AI Settings', shortLabel: 'AI Engine' },
    { id: 'model', label: 'Model Settings', shortLabel: 'Model' },
    { id: 'thinking', label: 'Thinking Settings', shortLabel: 'Thinking' },
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
                <span className="api-modal__tab-full">{page.label}</span>
                <span className="api-modal__tab-short">{page.shortLabel}</span>
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

                {/* 9Router Engine */}
                {aiEngine === '9router' && (
                  <div className="ninerouter-container">
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

                    {/* Active Selected Model Display */}
                    <div className="api-modal__field">
                      <div className="api-modal__field-header">
                        <label className="api-modal__label">Model / Combo 9Router Aktif</label>
                        {ninerouterModel && (
                          <span className="ninerouter-active-pill">
                            <span className="ninerouter-active-dot"></span>
                            Aktif: <strong>{ninerouterModel}</strong>
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        className="api-modal__input ninerouter-active-input"
                        placeholder="Pilih dari daftar combo di bawah atau ketik manual..."
                        value={ninerouterModel}
                        onChange={(e) => setNinerouterModel(e.target.value)}
                      />
                    </div>

                    {/* Add Combo Input */}
                    <div className="api-modal__field">
                      <label className="api-modal__label">Tambah Model / Combo Baru</label>
                      <div className="ninerouter-add-row">
                        <input
                          type="text"
                          className="api-modal__input ninerouter-add-input"
                          placeholder="Ketik nama combo (contoh: gemini-3-pro-plus, claude-3-7-sonnet)"
                          value={newComboInput}
                          onChange={(e) => setNewComboInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNinerouterCombo();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="api-modal__btn api-modal__btn--primary ninerouter-add-btn"
                          disabled={!newComboInput.trim()}
                          onClick={handleAddNinerouterCombo}
                        >
                          <span>＋</span> Tambah Combo
                        </button>
                      </div>
                    </div>

                    {/* Combo List Grid */}
                    <div className="api-modal__field">
                      <div className="api-modal__field-header">
                        <label className="api-modal__label">Daftar Pilihan Combo ({ninerouterCombos.length})</label>
                        <span className="api-modal__hint">Klik combo untuk memilih, atau klik tombol ✕ untuk menghapus</span>
                      </div>

                      {ninerouterCombos.length === 0 ? (
                        <div className="ninerouter-empty">
                          <p>Belum ada combo di daftar. Tambahkan nama combo di atas.</p>
                        </div>
                      ) : (
                        <div className="ninerouter-combos-grid">
                          {ninerouterCombos.map((combo) => {
                            const isSelected = ninerouterModel === combo;
                            return (
                              <div
                                key={combo}
                                className={`ninerouter-combo-card ${isSelected ? 'ninerouter-combo-card--active' : ''}`}
                                onClick={() => handleSelectNinerouterCombo(combo)}
                              >
                                <div className="ninerouter-combo-card__content">
                                  <span className="ninerouter-combo-card__icon">{isSelected ? '⚡' : '🔮'}</span>
                                  <span className="ninerouter-combo-card__name" title={combo}>{combo}</span>
                                </div>
                                <div className="ninerouter-combo-card__actions">
                                  {isSelected && (
                                    <span className="ninerouter-combo-card__badge">Dipilih</span>
                                  )}
                                  <button
                                    type="button"
                                    className="ninerouter-combo-card__del-btn"
                                    title={`Hapus combo "${combo}"`}
                                    onClick={(e) => handleDeleteNinerouterCombo(combo, e)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
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
