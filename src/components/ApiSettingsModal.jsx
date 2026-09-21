import { useState, useEffect } from 'react';
import './ApiSettingsModal.css';

const initialModels = [
  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (🔥 Generasi Terkini & Super Cepat)' },
  { id: 'gemini-3.7-flash', label: 'gemini-3.7-flash (🌟 Sangat Cerdas & Responsif)' },
  { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash (💡 Seimbang & Cepat)' },
  { id: 'gemini-3.1-pro-preview', label: 'gemini-3.1-pro-preview (👑 Flagship Canggih)' },
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (⚡ Hemat Biaya / Flex Tier)' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro (🧠 Penalaran Logika)' },
];

const UNIVERSAL_MODELS = [
  // Google Gemini Models
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google',
    badge: '🔥 Generasi Terkini 3.8 (GA)',
    icon: '⚡',
    desc: 'Model generasi terkini Google Gemini yang paling cepat, cerdas, dan responsif dengan dukungan CoT Thinking.'
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google',
    badge: '🌟 Rekomendasi Terkini (GA)',
    icon: '💎',
    desc: 'Model Google yang sangat cepat, pintar, dan responsif untuk roleplay dengan reasoning terpadu.'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'Google',
    badge: '👑 Flagship Reasoning (Pratinjau)',
    icon: '🔮',
    desc: 'Penalaran tingkat tinggi untuk alur logika mendalam, intrik narasi kompleks, dan deskripsi detail.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    badge: '⚡ Cepat & Handal',
    icon: '✨',
    desc: 'Model serbaguna generasi 2.5 dengan latensi rendah dan pemikiran adaptif.'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    badge: '🎯 Pro 2.5',
    icon: '👑',
    desc: 'Model flagship generasi 2.5 untuk skenario narasi mendalam.'
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

  // Official Gemini / Vertex AI Settings
  const [geminiProvider, setGeminiProvider] = useState('studio'); // 'studio' | 'vertex'
  const [vertexProjectId, setVertexProjectId] = useState('');
  const [vertexLocation, setVertexLocation] = useState('us-central1');
  const [vertexServiceTier, setVertexServiceTier] = useState('flex'); // 'flex' | 'standard'
  const [vertexCredentials, setVertexCredentials] = useState('');
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestFeedback, setGeminiTestFeedback] = useState(null);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('apiSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey !== undefined) setApiKey(parsed.apiKey);
        if (parsed.models) {
          let updatedModels = [...parsed.models];
          const newDefaults = [
            { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash (🔥 Generasi Terkini & Super Cepat)' },
            { id: 'gemini-3.7-flash', label: 'gemini-3.7-flash (🌟 Sangat Cerdas & Responsif)' },
            { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash (💡 Seimbang & Cepat)' },
            { id: 'gemini-3.1-pro-preview', label: 'gemini-3.1-pro-preview (👑 Flagship Canggih)' },
            { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash (⚡ Hemat Biaya / Flex Tier)' },
            { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro (🧠 Penalaran Logika)' },
          ];
          for (const m of newDefaults) {
            if (!updatedModels.some(existing => existing.id === m.id)) {
              updatedModels.push(m);
            }
          }
          setModels(updatedModels);
        }
        if (parsed.activeModelId) {
          // If previous active model was gemma, automatically migrate to gemini-3.8-flash
          if (parsed.activeModelId.toLowerCase().includes('gemma')) {
            setActiveModelId('gemini-3.8-flash');
          } else {
            setActiveModelId(parsed.activeModelId);
          }
        }
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

        // Official Gemini / Vertex AI settings
        if (parsed.geminiProvider) setGeminiProvider(parsed.geminiProvider);
        if (parsed.vertexProjectId !== undefined) setVertexProjectId(parsed.vertexProjectId);
        if (parsed.vertexLocation !== undefined) setVertexLocation(parsed.vertexLocation);
        if (parsed.vertexServiceTier !== undefined) setVertexServiceTier(parsed.vertexServiceTier);
        if (parsed.vertexCredentials !== undefined) setVertexCredentials(parsed.vertexCredentials);
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

  const handleVertexCredentialsChange = (val) => {
    setVertexCredentials(val);
    const trimmed = val.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.project_id && !vertexProjectId) {
          setVertexProjectId(parsed.project_id);
        }
      } catch (e) {
        // ignore parse error while typing
      }
    }
  };

  const handleTestGeminiConnection = async () => {
    setIsTestingGemini(true);
    setGeminiTestFeedback(null);
    try {
      const res = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiSettings: {
            geminiProvider,
            apiKey,
            vertexProjectId,
            vertexLocation,
            vertexServiceTier,
            vertexCredentials,
            activeModelId
          }
        })
      });
      const data = await res.json();
      setGeminiTestFeedback({
        success: data.success,
        message: data.message || (data.success ? 'Koneksi berhasil!' : 'Koneksi gagal.'),
        sampleResponse: data.sampleResponse,
        latency: data.latency
      });
    } catch (err) {
      setGeminiTestFeedback({
        success: false,
        message: `Gagal menghubungi server: ${err.message}`
      });
    } finally {
      setIsTestingGemini(false);
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
      geminiProvider,
      vertexProjectId,
      vertexLocation,
      vertexServiceTier,
      vertexCredentials,
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
          {/* HEADER */}
          <div className="api-modal__header">
            <div className="api-modal__header-left">
              <div className="api-modal__header-badge">
                <span>⚡</span>
              </div>
              <div>
                <h2 className="api-modal__title" id="api-modal-title">Pengaturan AI & Model</h2>
                <p className="api-modal__subtitle">Konfigurasi engine provider, model pilihan, dan parameter roleplay</p>
              </div>
            </div>
            <button className="api-modal__close" onClick={onClose} type="button" aria-label="Tutup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* SEGMENTED TAB BAR */}
          <div className="api-modal__nav-wrapper">
            <div className="api-modal__segmented-control">
              <button
                type="button"
                className={`api-segment-btn ${activePage === 'ai' ? 'api-segment-btn--active' : ''}`}
                onClick={() => setActivePage('ai')}
              >
                <span className="api-segment-icon">🚀</span>
                <span className="api-segment-text">AI Engine</span>
              </button>
              <button
                type="button"
                className={`api-segment-btn ${activePage === 'model' ? 'api-segment-btn--active' : ''}`}
                onClick={() => setActivePage('model')}
              >
                <span className="api-segment-icon">🎛️</span>
                <span className="api-segment-text">Parameter</span>
              </button>
              <button
                type="button"
                className={`api-segment-btn ${activePage === 'thinking' ? 'api-segment-btn--active' : ''}`}
                onClick={() => setActivePage('thinking')}
              >
                <span className="api-segment-icon">🧠</span>
                <span className="api-segment-text">Reasoning</span>
              </button>
            </div>
          </div>

          {/* CONTENT BODY */}
          <div className="api-modal__content">
            {activePage === 'ai' && (
              <div className="api-modal__section">
                
                {/* Engine Selector Cards */}
                <div className="api-card-group">
                  <div className="api-group-title">
                    <span>Pilih Provider AI Engine</span>
                  </div>
                  <div className="api-engine-selector-grid">
                    {/* 9Router Card */}
                    <div
                      className={`api-engine-card ${aiEngine === '9router' ? 'api-engine-card--active' : ''}`}
                      onClick={() => setAiEngine('9router')}
                    >
                      <div className="api-engine-card__header">
                        <span className="api-engine-card__icon">🚀</span>
                        <span className="api-engine-card__tag api-engine-card__tag--hot">Rekomendasi</span>
                      </div>
                      <div className="api-engine-card__name">9Router Gateway</div>
                      <div className="api-engine-card__desc">Multi-Model AI Proxy (Gemini, Claude, DeepSeek)</div>
                      <div className="api-engine-card__indicator">
                        <span className={`api-radio-dot ${aiEngine === '9router' ? 'api-radio-dot--active' : ''}`} />
                        <span>{aiEngine === '9router' ? 'Sedang Aktif' : 'Gunakan'}</span>
                      </div>
                    </div>

                    {/* Universal Proxy Card */}
                    <div
                      className={`api-engine-card ${aiEngine === 'universal' ? 'api-engine-card--active' : ''}`}
                      onClick={() => setAiEngine('universal')}
                    >
                      <div className="api-engine-card__header">
                        <span className="api-engine-card__icon">🌐</span>
                        <span className="api-engine-card__tag">Web Reverse</span>
                      </div>
                      <div className="api-engine-card__name">Universal Proxy</div>
                      <div className="api-engine-card__desc">Gemini & Claude Web2API via Cookie VPS</div>
                      <div className="api-engine-card__indicator">
                        <span className={`api-radio-dot ${aiEngine === 'universal' ? 'api-radio-dot--active' : ''}`} />
                        <span>{aiEngine === 'universal' ? 'Sedang Aktif' : 'Gunakan'}</span>
                      </div>
                    </div>

                    {/* Official Gemini API Card */}
                    <div
                      className={`api-engine-card ${aiEngine === 'api' ? 'api-engine-card--active' : ''}`}
                      onClick={() => setAiEngine('api')}
                    >
                      <div className="api-engine-card__header">
                        <span className="api-engine-card__icon">🔑</span>
                        <span className="api-engine-card__tag">Official Key</span>
                      </div>
                      <div className="api-engine-card__name">Gemini API</div>
                      <div className="api-engine-card__desc">Kunci API Resmi Google AI Studio</div>
                      <div className="api-engine-card__indicator">
                        <span className={`api-radio-dot ${aiEngine === 'api' ? 'api-radio-dot--active' : ''}`} />
                        <span>{aiEngine === 'api' ? 'Sedang Aktif' : 'Gunakan'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 9ROUTER DETAIL SECTION */}
                {aiEngine === '9router' && (
                  <div className="api-subengine-panel">
                    {/* Box 1: Koneksi Gateway */}
                    <div className="api-section-card">
                      <div className="api-section-card__header">
                        <div className="api-section-card__title">
                          <span>🌐</span> Koneksi Endpoint 9Router
                        </div>
                        <span className="api-section-card__badge">Gateway API</span>
                      </div>

                      <div className="api-form-grid">
                        <div className="api-form-field">
                          <label className="api-form-label">
                            <span className="api-label-icon">🔗</span> URL Endpoint
                          </label>
                          <input
                            type="text"
                            className="api-modal__input"
                            placeholder="https://supernova-inovategames.me/v1"
                            value={ninerouterUrl}
                            onChange={(e) => setNinerouterUrl(e.target.value)}
                          />
                          <span className="api-input-hint">URL endpoint gateway 9Router kompatibel format OpenAI /v1.</span>
                        </div>

                        <div className="api-form-field">
                          <label className="api-form-label">
                            <span className="api-label-icon">🔑</span> API Key 9Router
                          </label>
                          <input
                            type="password"
                            className="api-modal__input"
                            placeholder="Masukkan API key 9Router (opsional jika endpoint publik)"
                            value={ninerouterApiKey}
                            onChange={(e) => setNinerouterApiKey(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Box 2: Model & Combos */}
                    <div className="api-section-card">
                      <div className="api-section-card__header">
                        <div className="api-section-card__title">
                          <span>⚡</span> Model / Combo Pilihan
                        </div>
                        {ninerouterModel && (
                          <span className="api-active-model-pill">
                            <span className="api-pulse-dot" />
                            Aktif: <strong>{ninerouterModel}</strong>
                          </span>
                        )}
                      </div>

                      {/* Active Model Display Bar */}
                      <div className="api-form-field">
                        <label className="api-form-label">Model yang Sedang Digunakan</label>
                        <div className="api-model-active-bar">
                          <span className="api-model-active-icon">🤖</span>
                          <input
                            type="text"
                            className="api-modal__input api-model-input-highlight"
                            placeholder="Pilih dari daftar combo di bawah atau ketik manual..."
                            value={ninerouterModel}
                            onChange={(e) => setNinerouterModel(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Add Combo Input */}
                      <div className="api-form-field" style={{ marginTop: '14px' }}>
                        <label className="api-form-label">Tambah Pilihan Combo Baru</label>
                        <div className="api-input-group">
                          <input
                            type="text"
                            className="api-modal__input api-input-group__input"
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
                            className="api-btn-primary api-input-group__btn"
                            disabled={!newComboInput.trim()}
                            onClick={handleAddNinerouterCombo}
                          >
                            ＋ Tambah
                          </button>
                        </div>
                      </div>

                      {/* Combos Grid */}
                      <div className="api-combos-container">
                        <div className="api-combos-header">
                          <span className="api-combos-label">Daftar Pilihan Cepat ({ninerouterCombos.length})</span>
                          <span className="api-combos-hint">Klik kartu untuk langsung mengaktifkan combo</span>
                        </div>
                        {ninerouterCombos.length === 0 ? (
                          <div className="ninerouter-empty">
                            <p>Belum ada combo di daftar. Tambahkan nama combo di atas.</p>
                          </div>
                        ) : (
                          <div className="api-combos-grid">
                            {ninerouterCombos.map((combo) => {
                              const isSelected = ninerouterModel === combo;
                              return (
                                <div
                                  key={combo}
                                  className={`api-combo-item ${isSelected ? 'api-combo-item--selected' : ''}`}
                                  onClick={() => handleSelectNinerouterCombo(combo)}
                                >
                                  <div className="api-combo-item__main">
                                    <span className="api-combo-item__icon">{isSelected ? '⚡' : '🔮'}</span>
                                    <span className="api-combo-item__name" title={combo}>{combo}</span>
                                  </div>
                                  <div className="api-combo-item__right">
                                    {isSelected && <span className="api-combo-item__badge">Aktif</span>}
                                    <button
                                      type="button"
                                      className="api-combo-item__delete-btn"
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
                  </div>
                )}

                {/* UNIVERSAL PROXY DETAIL SECTION */}
                {aiEngine === 'universal' && (
                  <div className="universal-proxy-container">
                    {/* Status Feedback Banner */}
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
                          <span className={`universal-status-pill ${universalStatus?.gemini?.alive ? 'universal-status-pill--online' : 'universal-status-pill--offline'}`}>
                            <span className="universal-dot" />
                            {universalStatus?.gemini?.alive ? 'Online' : 'Offline'}
                          </span>
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
                          >
                            {testRunningService === 'gemini' ? '⏳ Menguji...' : '⚡ Test Health'}
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--cookie"
                            onClick={() => handleOpenCookieModal('gemini')}
                          >
                            🍪 Cookie
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--restart"
                            onClick={() => handleRestartProxy('gemini')}
                            disabled={restartingService === 'gemini'}
                          >
                            {restartingService === 'gemini' ? '🔄...' : '🔄 Restart'}
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--logs"
                            onClick={() => handleOpenLogs('gemini')}
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
                          <span className={`universal-status-pill ${universalStatus?.claude?.alive ? 'universal-status-pill--online' : 'universal-status-pill--offline'}`}>
                            <span className="universal-dot" />
                            {universalStatus?.claude?.alive ? 'Online' : 'Offline'}
                          </span>
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
                        </div>

                        <div className="universal-card__actions">
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--test"
                            onClick={() => handleTestHealth('claude')}
                            disabled={testRunningService === 'claude'}
                          >
                            {testRunningService === 'claude' ? '⏳ Menguji...' : '⚡ Test Health'}
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--cookie"
                            onClick={() => handleOpenCookieModal('claude')}
                          >
                            🍪 Cookie
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--restart"
                            onClick={() => handleRestartProxy('claude')}
                            disabled={restartingService === 'claude'}
                          >
                            {restartingService === 'claude' ? '🔄...' : '🔄 Restart'}
                          </button>
                          <button
                            type="button"
                            className="universal-action-btn universal-action-btn--logs"
                            onClick={() => handleOpenLogs('claude')}
                          >
                            📜 Logs
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Model Selection Group */}
                    <div className="api-section-card">
                      <div className="api-section-card__header">
                        <div className="api-section-card__title">
                          <span>📦</span> Model AI Universal (Web Reverse Proxy)
                        </div>
                        <button
                          type="button"
                          className="universal-refresh-status-btn"
                          onClick={fetchUniversalStatus}
                          disabled={isUniversalStatusLoading}
                        >
                          {isUniversalStatusLoading ? '🔄...' : '🔄 Cek Status'}
                        </button>
                      </div>

                      {/* Gemini Category */}
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

                      {/* Claude Category */}
                      <div className="universal-model-category" style={{ marginTop: '16px' }}>
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

                      {/* Custom Model Input */}
                      <div className="universal-custom-model-row" style={{ marginTop: '14px' }}>
                        <input
                          type="text"
                          className="api-modal__input"
                          placeholder="Atau ketik ID Model custom (contoh: gemini-3.7-flash, claude-haiku-4-5)..."
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
                          className="api-btn-primary"
                          onClick={handleApplyCustomUniversalModel}
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>

                    {/* Advanced Proxy URL */}
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
                          Default: <code>http://127.0.0.1:8083</code> (Universal Control Panel Router).
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* OFFICIAL GEMINI / VERTEX AI DETAIL SECTION */}
                {aiEngine === 'api' && (
                  <div className="api-subengine-panel">
                    <div className="api-section-card">
                      <div className="api-section-card__header">
                        <div className="api-section-card__title">
                          <span>✨</span> Google GenAI Engine (Official & GCP Vertex AI)
                        </div>
                        <span className="api-section-card__badge">
                          {geminiProvider === 'vertex' ? 'GCP Vertex AI' : 'AI Studio'}
                        </span>
                      </div>

                      {/* Sub-Provider Selector: AI Studio vs Vertex AI */}
                      <div className="api-provider-segmented-control">
                        <button
                          type="button"
                          className={`api-segmented-btn ${geminiProvider === 'studio' ? 'api-segmented-btn--active' : ''}`}
                          onClick={() => {
                            setGeminiProvider('studio');
                            setGeminiTestFeedback(null);
                          }}
                        >
                          <span className="api-segmented-icon">🔑</span>
                          <span className="api-segmented-text">
                            <strong>Google AI Studio</strong>
                            <small>API Key Mandiri (AIzaSy...)</small>
                          </span>
                        </button>

                        <button
                          type="button"
                          className={`api-segmented-btn ${geminiProvider === 'vertex' ? 'api-segmented-btn--active' : ''}`}
                          onClick={() => {
                            setGeminiProvider('vertex');
                            setGeminiTestFeedback(null);
                          }}
                        >
                          <span className="api-segmented-icon">☁️</span>
                          <span className="api-segmented-text">
                            <strong>GCP Vertex AI</strong>
                            <small>Saldo / Kredit Google Cloud</small>
                          </span>
                        </button>
                      </div>

                      {/* Google AI Studio Form */}
                      {geminiProvider === 'studio' && (
                        <div className="api-form-field" style={{ marginTop: '8px' }}>
                          <label className="api-form-label" htmlFor="api-key-input">Gemini API Key</label>
                          <input
                            id="api-key-input"
                            className="api-modal__input"
                            type="password"
                            placeholder="Masukkan API key Google AI Studio kamu (AIzaSy...)"
                            value={apiKey}
                            onChange={(event) => setApiKey(event.target.value)}
                          />
                          <span className="api-input-hint">
                            Dapatkan kunci gratis dari <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Google AI Studio</a>. Disimpan aman secara lokal di browser.
                          </span>
                        </div>
                      )}

                      {/* GCP Vertex AI Form */}
                      {geminiProvider === 'vertex' && (
                        <div className="api-vertex-form" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div className="api-info-box api-info-box--vertex">
                            <span className="api-info-box__icon">💡</span>
                            <div className="api-info-box__content">
                              <strong>Kredit & Saldo Google Cloud:</strong>
                              <p>Seluruh pemanggilan API Gemini akan otomatis memotong kuota saldo/kredit GCP pada Billing Account proyek Anda. Pastikan <code>Vertex AI API</code> sudah diaktifkan di GCP Console.</p>
                            </div>
                          </div>

                          <div className="api-form-grid">
                            <div className="api-form-field">
                              <label className="api-form-label">
                                <span className="api-label-icon">🆔</span> Project ID GCP
                              </label>
                              <input
                                className="api-modal__input"
                                type="text"
                                placeholder="misal: my-chatbot-project-12345"
                                value={vertexProjectId}
                                onChange={(e) => setVertexProjectId(e.target.value)}
                              />
                              <span className="api-input-hint">ID Proyek GCP Anda (otomatis terisi bila paste JSON).</span>
                            </div>

                            <div className="api-form-field">
                              <label className="api-form-label">
                                <span className="api-label-icon">🌐</span> Region / Location
                              </label>
                              <select
                                className="api-modal__input api-select-dropdown"
                                value={vertexLocation}
                                onChange={(e) => setVertexLocation(e.target.value)}
                              >
                                <option value="global">global (🌍 Rekomendasi Google untuk Flex PayGo)</option>
                                <option value="us-central1">us-central1 (Iowa - Kuota Terbesar)</option>
                                <option value="asia-southeast1">asia-southeast1 (Singapura - Latensi Cepat)</option>
                                <option value="asia-east1">asia-east1 (Taiwan)</option>
                                <option value="us-east4">us-east4 (Virginia)</option>
                                <option value="europe-west1">europe-west1 (Belgia)</option>
                              </select>
                              <span className="api-input-hint">Wilayah server komputasi Vertex AI (pilih "global" atau "us-central1").</span>
                            </div>
                          </div>

                          <div className="api-form-field">
                            <label className="api-form-label">
                              <span className="api-label-icon">💰</span> Service Tier (Kategori Hemat Biaya)
                            </label>
                            <select
                              className="api-modal__input api-select-dropdown"
                              value={vertexServiceTier}
                              onChange={(e) => setVertexServiceTier(e.target.value)}
                            >
                              <option value="flex">⚡ Flex Tier (Diskon Harga ~50% / Saldo GCP Jauh Lebih Awet)</option>
                              <option value="standard">Standard Tier (Harga Normal / Prioritas Standar)</option>
                            </select>
                            <span className="api-input-hint">
                              Flex Tier mengaktifkan <code>service_tier="flex"</code> yang memangkas biaya token secara drastis untuk menghemat kredit GCP Anda.
                            </span>
                          </div>

                          <div className="api-form-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label className="api-form-label">
                                <span className="api-label-icon">📜</span> Service Account JSON Key
                              </label>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Bisa Paste JSON atau Tulis Path File</span>
                            </div>
                            <textarea
                              className="api-modal__input api-textarea-code"
                              rows={4}
                              placeholder={`Paste isi file service_account.json di sini...\nAtau isi path file lokal di VPS/Docker, contoh: /app/gcp-key.json\n(Bisa dikosongkan jika menggunakan GOOGLE_APPLICATION_CREDENTIALS di Docker)`}
                              value={vertexCredentials}
                              onChange={(e) => handleVertexCredentialsChange(e.target.value)}
                            />
                            <span className="api-input-hint">
                              Butuh role <code>Vertex AI User</code> (<code>roles/aiplatform.user</code>). Disimpan aman di browser/Docker Anda.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Test Connection Button & Feedback */}
                      <div className="api-test-connection-section" style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="api-btn-test-action"
                            disabled={isTestingGemini}
                            onClick={handleTestGeminiConnection}
                          >
                            {isTestingGemini ? (
                              <>
                                <span className="api-btn-spinner" />
                                <span>Menguji Koneksi {geminiProvider === 'vertex' ? 'Vertex AI' : 'AI Studio'}...</span>
                              </>
                            ) : (
                              <>
                                <span>⚡</span>
                                <span>Test Koneksi {geminiProvider === 'vertex' ? 'Vertex AI (GCP)' : 'Google AI Studio'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {geminiTestFeedback && (
                          <div className={`api-test-feedback-box ${geminiTestFeedback.success ? 'api-test-feedback-box--success' : 'api-test-feedback-box--error'}`}>
                            <div className="api-test-feedback-header">
                              <span className="api-test-feedback-icon">
                                {geminiTestFeedback.success ? '✅' : '❌'}
                              </span>
                              <span className="api-test-feedback-title">
                                {geminiTestFeedback.success ? 'Koneksi Berhasil!' : 'Koneksi Gagal'}
                              </span>
                              {geminiTestFeedback.latency && (
                                <span className="api-test-feedback-latency">
                                  {geminiTestFeedback.latency} ms
                                </span>
                              )}
                            </div>
                            <p className="api-test-feedback-msg">{geminiTestFeedback.message}</p>
                            {geminiTestFeedback.sampleResponse && (
                              <div className="api-test-feedback-sample">
                                <em>Respon Model:</em> "{geminiTestFeedback.sampleResponse}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Model Selection */}
                      <div className="api-form-field" style={{ marginTop: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.07)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label className="api-form-label">
                            <span className="api-label-icon">🤖</span> Model yang Aktif Digunakan
                          </label>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Model Aktif: <strong style={{ color: '#a78bfa' }}>{activeModelId}</strong>
                          </span>
                        </div>
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

                        <div className="api-input-group" style={{ marginTop: '12px' }}>
                          <input
                            className="api-modal__input api-input-group__input"
                            type="text"
                            placeholder="Tambah model baru, contoh: gemini-2.5-pro"
                            value={newModelId}
                            onChange={(event) => setNewModelId(event.target.value)}
                          />
                          <button className="api-btn-primary api-input-group__btn" type="button" onClick={handleAddModel}>
                            ＋ Tambah
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: PARAMETER MODEL */}
            {activePage === 'model' && (
              <div className="api-section-card">
                <div className="api-section-card__header">
                  <div className="api-section-card__title">
                    <span>🎛️</span> Parameter Generasi AI
                  </div>
                  <span className="api-section-card__badge">Tuning Parameter</span>
                </div>

                <div className="api-params-list">
                  {/* Temperature Card */}
                  <div className="api-param-row">
                    <div className="api-param-info">
                      <div className="api-param-title-wrap">
                        <span className="api-param-name">🌡️ Temperature (Kreativitas)</span>
                        <span className="api-param-badge">{temperature}</span>
                      </div>
                      <p className="api-param-desc">Mengatur tingkat variasi & imajinasi respon (0 = fokus/kaku, 0.8 = ideal roleplay, 1.5+ = sangat kreatif).</p>
                    </div>
                    <div className="api-slider-wrapper">
                      <input
                        className="api-custom-slider"
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={temperature}
                        onChange={(event) => setTemperature(parseFloat(event.target.value))}
                      />
                      <div className="api-slider-labels">
                        <span>Fokus (0.0)</span>
                        <span>Seimbang (0.8)</span>
                        <span>Kreatif (2.0)</span>
                      </div>
                    </div>
                  </div>

                  {/* Top P Card */}
                  <div className="api-param-row">
                    <div className="api-param-info">
                      <div className="api-param-title-wrap">
                        <span className="api-param-name">🎯 Top P (Nucleus Sampling)</span>
                        <span className="api-param-badge">{topP}</span>
                      </div>
                      <p className="api-param-desc">Membatasi pemilihan kata hanya pada kelompok kata dengan probabilitas kumulatif tertinggi.</p>
                    </div>
                    <div className="api-slider-wrapper">
                      <input
                        className="api-custom-slider"
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={topP}
                        onChange={(event) => setTopP(parseFloat(event.target.value))}
                      />
                    </div>
                  </div>

                  {/* Top K Card */}
                  <div className="api-param-row">
                    <div className="api-param-info">
                      <div className="api-param-title-wrap">
                        <span className="api-param-name">🎲 Top K</span>
                        <span className="api-param-badge">{topK}</span>
                      </div>
                      <p className="api-param-desc">Jumlah kandidat kata teratas yang dipertimbangkan di setiap langkah generasi kata.</p>
                    </div>
                    <div className="api-slider-wrapper">
                      <input
                        className="api-custom-slider"
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={topK}
                        onChange={(event) => setTopK(parseInt(event.target.value))}
                      />
                    </div>
                  </div>

                  {/* Max Output Tokens Card */}
                  <div className="api-param-row">
                    <div className="api-param-info">
                      <div className="api-param-title-wrap">
                        <span className="api-param-name">📏 Max Output Tokens</span>
                        <span className="api-param-badge">{maxTokens} tokens</span>
                      </div>
                      <p className="api-param-desc">Batas panjang karakter respon maksimum yang dapat dihasilkan oleh model AI.</p>
                    </div>
                    <div className="api-slider-wrapper">
                      <input
                        className="api-custom-slider"
                        type="range"
                        min="512"
                        max="16384"
                        step="256"
                        value={maxTokens}
                        onChange={(event) => setMaxTokens(parseInt(event.target.value))}
                      />
                      <div className="api-presets-row">
                        {[2048, 4096, 8192, 16384].map((tokensVal) => (
                          <button
                            key={tokensVal}
                            type="button"
                            className={`api-preset-chip ${maxTokens === tokensVal ? 'api-preset-chip--active' : ''}`}
                            onClick={() => setMaxTokens(tokensVal)}
                          >
                            {tokensVal >= 1024 ? `${tokensVal / 1024}K` : tokensVal}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* History Limit Card */}
                  <div className="api-param-row">
                    <div className="api-param-info">
                      <div className="api-param-title-wrap">
                        <span className="api-param-name">📜 History Limit (Konteks Memori)</span>
                        <span className="api-param-badge">{historyLimit} Pesan</span>
                      </div>
                      <p className="api-param-desc">Jumlah pesan riwayat percakapan sebelumnya yang disertakan sebagai konteks memori aktif.</p>
                    </div>
                    <div className="api-slider-wrapper">
                      <input
                        className="api-custom-slider"
                        type="range"
                        min="4"
                        max="60"
                        step="2"
                        value={historyLimit}
                        onChange={(event) => setHistoryLimit(parseInt(event.target.value))}
                      />
                      <div className="api-presets-row">
                        {[10, 16, 24, 40].map((limitVal) => (
                          <button
                            key={limitVal}
                            type="button"
                            className={`api-preset-chip ${historyLimit === limitVal ? 'api-preset-chip--active' : ''}`}
                            onClick={() => setHistoryLimit(limitVal)}
                          >
                            {limitVal} pesan
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: THINKING & REASONING */}
            {activePage === 'thinking' && (
              <div className="api-section-card">
                <div className="api-section-card__header">
                  <div className="api-section-card__title">
                    <span>🧠</span> Penalaran & Thinking Mode
                  </div>
                  <span className="api-section-card__badge">Deep Reasoning</span>
                </div>

                {/* Toggle Card */}
                <div className="api-toggle-card">
                  <div className="api-toggle-card__left">
                    <div className="api-toggle-card__title">Aktifkan Thinking Mode (CoT)</div>
                    <div className="api-toggle-card__desc">
                      Membuat AI memikirkan penalaran mendalam sebelum merespon. Sangat efektif untuk skenario roleplay dramatis, puzzle, dan karakter berwatak kompleks.
                    </div>
                  </div>
                  <button
                    className={`api-switch-btn ${thinkingEnabled ? 'api-switch-btn--on' : ''}`}
                    type="button"
                    onClick={() => setThinkingEnabled((prev) => !prev)}
                    aria-pressed={thinkingEnabled}
                  >
                    <span className="api-switch-knob" />
                  </button>
                </div>

                {/* Thinking Level Cards */}
                <div className="api-form-field" style={{ marginTop: '16px' }}>
                  <label className="api-form-label">Tingkat Intensitas Penalaran (Thinking Level)</label>
                  <div className={`api-thinking-levels-grid ${!thinkingEnabled ? 'api-thinking-levels-grid--disabled' : ''}`}>
                    <div
                      className={`api-level-card ${(thinkingLevel === 'minimal' || thinkingLevel === 'low') ? 'api-level-card--active' : ''}`}
                      onClick={() => thinkingEnabled && setThinkingLevel('low')}
                    >
                      <div className="api-level-card__header">
                        <span className="api-level-card__icon">⚡</span>
                        <span className="api-level-card__name">LOW (Minimal)</span>
                      </div>
                      <p className="api-level-card__desc">Penalaran cepat dan ringkas, cocok untuk pencarian atau respon chat biasa.</p>
                      <span className={`api-level-card__indicator ${(thinkingLevel === 'minimal' || thinkingLevel === 'low') ? 'api-level-card__indicator--active' : ''}`} />
                    </div>

                    <div
                      className={`api-level-card ${thinkingLevel === 'medium' ? 'api-level-card--active' : ''}`}
                      onClick={() => thinkingEnabled && setThinkingLevel('medium')}
                    >
                      <div className="api-level-card__header">
                        <span className="api-level-card__icon">⚖️</span>
                        <span className="api-level-card__name">MEDIUM (Default)</span>
                      </div>
                      <p className="api-level-card__desc">Tingkat default resmi Google. Keseimbangan optimal untuk dialog dan narasi.</p>
                      <span className={`api-level-card__indicator ${thinkingLevel === 'medium' ? 'api-level-card__indicator--active' : ''}`} />
                    </div>

                    <div
                      className={`api-level-card ${thinkingLevel === 'high' ? 'api-level-card--active' : ''}`}
                      onClick={() => thinkingEnabled && setThinkingLevel('high')}
                    >
                      <div className="api-level-card__header">
                        <span className="api-level-card__icon">🔮</span>
                        <span className="api-level-card__name">HIGH (Mendalam)</span>
                      </div>
                      <p className="api-level-card__desc">Penalaran penuh & detail untuk adegan dramatis, psikologi karakter, dan emosi berlapis.</p>
                      <span className={`api-level-card__indicator ${thinkingLevel === 'high' ? 'api-level-card__indicator--active' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="api-modal__footer">
            <span className="api-modal__footer-note">Pengaturan langsung disimpan ke memori lokal browser kamu.</span>
            <div className="api-modal__actions">
              <button className="api-modal__btn api-modal__btn--ghost" type="button" onClick={onClose}>
                Batal
              </button>
              <button className="api-modal__btn api-modal__btn--primary" type="button" onClick={handleSave}>
                Simpan Pengaturan
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
