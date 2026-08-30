import { useState, useEffect } from 'react';
import './ApiSettingsModal.css';

const initialModels = [
  { id: 'gemma-4-31b-it', label: 'gemma-4-31b-it' },
  { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
];

const PUTER_MODEL_METADATA = {
  // Anthropic
  'claude-3-7-sonnet': { name: 'Claude 3.7 Sonnet', provider: 'Anthropic', icon: '🧠', desc: 'Model terbaru Anthropic dengan hybrid reasoning & coding terbaik' },
  'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🧠', desc: 'Model sangat cerdas dan bernalar tinggi dari Anthropic' },
  'claude-3-5-haiku': { name: 'Claude 3.5 Haiku', provider: 'Anthropic', icon: '🪶', desc: 'Super cepat, hemat, dan responsif' },
  'claude-3-opus': { name: 'Claude 3 Opus', provider: 'Anthropic', icon: '👑', desc: 'Model analitis mendalam dari Anthropic' },
  
  // OpenAI
  'o3-mini': { name: 'o3-mini', provider: 'OpenAI', icon: '⚡', desc: 'Model penalaran terbaru OpenAI yang cepat dan presisi' },
  'o1': { name: 'o1', provider: 'OpenAI', icon: '🧠', desc: 'Flagship reasoning model OpenAI dengan CoT mendalam' },
  'o1-mini': { name: 'o1-mini', provider: 'OpenAI', icon: '🔬', desc: 'Penalaran STEM dan coding hemat daya' },
  'gpt-4o': { name: 'GPT-4o', provider: 'OpenAI', icon: '✨', desc: 'Model flagship multimodal unggulan OpenAI' },
  'gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'OpenAI', icon: '⚡', desc: 'Cepat, cerdas, dan sangat hemat' },
  'chatgpt-4o-latest': { name: 'ChatGPT-4o Latest', provider: 'OpenAI', icon: '🤖', desc: 'Versi ChatGPT-4o terkini' },
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', provider: 'OpenAI', icon: '🤖', desc: 'Model klasik OpenAI' },

  // Google
  'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', provider: 'Google', icon: '💎', desc: 'Generasi terbaru Google, super cepat dan cerdas' },
  'gemini-2.0-pro-exp-02-05': { name: 'Gemini 2.0 Pro Exp', provider: 'Google', icon: '👑', desc: 'Model Gemini 2.0 paling bertenaga untuk penalaran rumit' },
  'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', provider: 'Google', icon: '👑', desc: 'Kapasitas konteks raksasa dan penalaran pro' },
  'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', provider: 'Google', icon: '⚡', desc: 'Ringan dan cepat dari Google' },

  // DeepSeek
  'deepseek-reasoner': { name: 'DeepSeek Reasoner (R1)', provider: 'DeepSeek', icon: '🌲', desc: 'Model penalaran terobosan (Chain-of-Thought) DeepSeek' },
  'deepseek-chat': { name: 'DeepSeek Chat (V3)', provider: 'DeepSeek', icon: '🧭', desc: 'Model 671B MoE terdepan dari DeepSeek' },

  // xAI
  'grok-2-latest': { name: 'Grok 2 Latest', provider: 'xAI', icon: '🚀', desc: 'Model AI terkemuka dari xAI (Elon Musk)' },
  'grok-beta': { name: 'Grok Beta', provider: 'xAI', icon: '🚀', desc: 'Versi preview Grok dari xAI' },

  // Qwen (Alibaba)
  'qwen/qwen-2.5-72b-instruct': { name: 'Qwen 2.5 72B Instruct', provider: 'Alibaba Cloud', icon: '🌐', desc: 'Model open-weight kelas dunia dari Alibaba' },
  'qwen/qwq-32b-preview': { name: 'QwQ 32B Preview', provider: 'Alibaba Cloud', icon: '🔬', desc: 'Model penalaran matematika & coding Qwen' },

  // Meta & Mistral
  'meta-llama/llama-3.3-70b-instruct': { name: 'Llama 3.3 70B Instruct', provider: 'Meta AI', icon: '🦙', desc: 'Model open source generasi terbaru dari Meta' },
  'meta-llama/llama-3.2-11b-vision-instruct': { name: 'Llama 3.2 11B Vision', provider: 'Meta AI', icon: '👁️', desc: 'Model vision & multimodal dari Meta' },
  'meta-llama/meta-llama-3.1-70b-instruct': { name: 'Llama 3.1 70B', provider: 'Meta AI', icon: '🦙', desc: 'Model Llama 3.1 70B parameter' },
  'mistral-large-latest': { name: 'Mistral Large', provider: 'Mistral AI', icon: '🌪️', desc: 'Model flagship dari Mistral AI' },
  'codestral-latest': { name: 'Codestral', provider: 'Mistral AI', icon: '💻', desc: 'Spesialis generasi dan pemahaman kode' },
  'pixtral-large-latest': { name: 'Pixtral Large', provider: 'Mistral AI', icon: '🖼️', desc: 'Model multimodal flagship Mistral' }
};

function extractProvider(modelId) {
  if (!modelId) return 'AI Provider';
  const lower = modelId.toLowerCase();
  if (lower.includes('claude') || lower.includes('anthropic')) return 'Anthropic';
  if (lower.includes('gpt') || lower.includes('o1') || lower.includes('o3') || lower.includes('openai') || lower.includes('chatgpt')) return 'OpenAI';
  if (lower.includes('gemini') || lower.includes('google')) return 'Google';
  if (lower.includes('deepseek')) return 'DeepSeek';
  if (lower.includes('grok') || lower.includes('xai') || lower.includes('x-ai')) return 'xAI';
  if (lower.includes('qwen') || lower.includes('alibaba') || lower.includes('qwq')) return 'Alibaba';
  if (lower.includes('llama') || lower.includes('meta')) return 'Meta AI';
  if (lower.includes('mistral') || lower.includes('codestral') || lower.includes('pixtral')) return 'Mistral AI';
  if (modelId.includes('/')) return modelId.split('/')[0];
  return 'Puter AI';
}

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

  // AI Engine selector ('api', 'puter', 'copilot', 'gravity', '9router')
  const [aiEngine, setAiEngine] = useState('api');

  // Puter Proxy Settings
  const [puterModel, setPuterModel] = useState('claude-3-5-sonnet');
  const [puterKeys, setPuterKeys] = useState([]); // [{ id, token, label, status: 'ready'|'limited' }]
  const [puterActiveKeyId, setPuterActiveKeyId] = useState(null);
  const [newPuterKey, setNewPuterKey] = useState('');
  const [customPuterModel, setCustomPuterModel] = useState('');
  const [isModelCatalogOpen, setIsModelCatalogOpen] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogProviderFilter, setCatalogProviderFilter] = useState('all');
  const [catalogModels, setCatalogModels] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [puterAuthUser, setPuterAuthUser] = useState(null);
  const [isPuterLoggingIn, setIsPuterLoggingIn] = useState(false);
  const [puterSdkStatus, setPuterSdkStatus] = useState('loading');

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

  // Load from localStorage on mount
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
        if (parsed.maxTokens !== undefined) setMaxTokens(parsed.maxTokens);
        if (parsed.historyLimit !== undefined) setHistoryLimit(parsed.historyLimit);
        if (parsed.thinkingEnabled !== undefined) setThinkingEnabled(parsed.thinkingEnabled);
        if (parsed.thinkingLevel) setThinkingLevel(parsed.thinkingLevel);
        
        // Engine selector (Migrate legacy 'proxy' to 'puter')
        if (parsed.aiEngine) {
          setAiEngine(parsed.aiEngine === 'proxy' ? 'puter' : parsed.aiEngine);
        }

        // Puter settings load
        if (parsed.puterModel !== undefined) setPuterModel(parsed.puterModel);
        if (Array.isArray(parsed.puterKeys)) setPuterKeys(parsed.puterKeys);
        if (parsed.puterActiveKeyId) setPuterActiveKeyId(parsed.puterActiveKeyId);

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
  }, []);

  // Check Puter SDK and Auth Status
  useEffect(() => {
    const checkPuter = async () => {
      if (typeof window !== 'undefined' && typeof window.puter !== 'undefined') {
        setPuterSdkStatus('ready');
        try {
          if (window.puter.auth && window.puter.auth.isSignedIn()) {
            const user = await window.puter.auth.getUser();
            setPuterAuthUser(user?.username || user?.name || 'Puter User');
          }
        } catch (err) {
          console.warn('Puter user check:', err);
        }
      } else {
        setPuterSdkStatus('loading');
        let retries = 0;
        const interval = setInterval(async () => {
          retries++;
          if (typeof window !== 'undefined' && typeof window.puter !== 'undefined') {
            clearInterval(interval);
            setPuterSdkStatus('ready');
            try {
              if (window.puter.auth && window.puter.auth.isSignedIn()) {
                const user = await window.puter.auth.getUser();
                setPuterAuthUser(user?.username || user?.name || 'Puter User');
              }
            } catch (e) {}
          } else if (retries > 10) {
            clearInterval(interval);
            setPuterSdkStatus('offline');
          }
        }, 500);
      }
    };
    if (isOpen) {
      checkPuter();
    }
  }, [isOpen]);

  // Load Catalog Models
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsCatalogLoading(true);
      try {
        const res = await fetch('https://api.puter.com/puterai/chat/models/details');
        if (res.ok) {
          const data = await res.json();
          if (data?.models && Array.isArray(data.models)) {
            const mapped = data.models.map(m => {
              const meta = PUTER_MODEL_METADATA[m.id] || PUTER_MODEL_METADATA[m.puterId] || {};
              return {
                id: m.id || m.puterId,
                name: m.name || meta.name || m.id,
                provider: m.provider || meta.provider || extractProvider(m.id || m.name),
                desc: m.description || meta.desc || `Model ${m.provider || 'AI'}`,
                context: m.context ? `${(m.context / 1024).toFixed(0)}k context` : (m.max_tokens ? `${m.max_tokens} tokens` : null),
                icon: meta.icon || '⚡'
              };
            });
            setCatalogModels(mapped);
            setIsCatalogLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch from Puter models API:', e);
      }

      // Fallback
      setCatalogModels(Object.keys(PUTER_MODEL_METADATA).map(k => ({
        id: k,
        name: PUTER_MODEL_METADATA[k].name,
        provider: PUTER_MODEL_METADATA[k].provider,
        desc: PUTER_MODEL_METADATA[k].desc,
        icon: PUTER_MODEL_METADATA[k].icon
      })));
      setIsCatalogLoading(false);
    };

    if (isOpen && catalogModels.length === 0) {
      fetchCatalog();
    }
  }, [isOpen, catalogModels.length]);

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

  // ==========================================
  // PUTER KEY MANAGEMENT HANDLERS
  // ==========================================
  const handleAddPuterKey = (customToken = '', customLabel = '') => {
    const tokenToAdd = (customToken || newPuterKey).trim();
    if (!tokenToAdd) return;

    // Check duplicate
    const exists = puterKeys.find(k => k.token === tokenToAdd);
    if (exists) {
      setPuterActiveKeyId(exists.id);
      setNewPuterKey('');
      return;
    }

    const keyIndex = puterKeys.length + 1;
    const newKeyObj = {
      id: 'key_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      token: tokenToAdd,
      label: customLabel || `Key #${keyIndex}`,
      status: 'ready'
    };

    const updatedKeys = [...puterKeys, newKeyObj];
    setPuterKeys(updatedKeys);
    if (!puterActiveKeyId || puterKeys.length === 0) {
      setPuterActiveKeyId(newKeyObj.id);
    }
    setNewPuterKey('');
  };

  const handleRemovePuterKey = (keyId) => {
    const updated = puterKeys.filter(k => k.id !== keyId);
    setPuterKeys(updated);
    if (puterActiveKeyId === keyId) {
      setPuterActiveKeyId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSetActivePuterKey = (keyId) => {
    setPuterActiveKeyId(keyId);
    // Reset status to ready if was limited
    setPuterKeys(prev => prev.map(k => k.id === keyId ? { ...k, status: 'ready' } : k));
  };

  const handlePuterLogin = async () => {
    if (typeof window === 'undefined' || typeof window.puter === 'undefined' || !window.puter.auth) {
      alert('Puter SDK belum siap. Silakan coba sesaat lagi atau paste token secara manual.');
      return;
    }
    try {
      setIsPuterLoggingIn(true);
      if (window.puter.auth.isSignedIn() && window.puter.auth.authToken) {
        const user = await window.puter.auth.getUser().catch(() => ({}));
        const username = user?.username || user?.name || 'Puter';
        setPuterAuthUser(username);
        handleAddPuterKey(window.puter.auth.authToken, `Akun @${username}`);
      } else {
        await window.puter.auth.signIn();
        if (window.puter.auth.authToken) {
          const user = await window.puter.auth.getUser().catch(() => ({}));
          const username = user?.username || user?.name || 'Puter';
          setPuterAuthUser(username);
          handleAddPuterKey(window.puter.auth.authToken, `Akun @${username}`);
        }
      }
    } catch (err) {
      console.warn('Puter login error:', err);
    } finally {
      setIsPuterLoggingIn(false);
    }
  };

  const handleSelectPuterModel = (modelId) => {
    setPuterModel(modelId);
    setIsModelCatalogOpen(false);
  };

  const handleApplyCustomPuterModel = () => {
    const trimmed = customPuterModel.trim();
    if (!trimmed) return;
    setPuterModel(trimmed);
    setCustomPuterModel('');
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
      puterModel,
      puterKeys,
      puterActiveKeyId,
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

  // Filter models in catalog
  const filteredCatalogModels = catalogModels.filter(m => {
    const query = catalogSearchQuery.trim().toLowerCase();
    const provider = catalogProviderFilter.toLowerCase();
    
    if (provider !== 'all') {
      const p = (m.provider || '').toLowerCase();
      const id = (m.id || '').toLowerCase();
      if (provider === 'anthropic' && !p.includes('anthropic') && !id.includes('claude')) return false;
      if (provider === 'openai' && !p.includes('openai') && !id.includes('gpt') && !id.includes('o1') && !id.includes('o3') && !id.includes('chatgpt')) return false;
      if (provider === 'google' && !p.includes('google') && !id.includes('gemini')) return false;
      if (provider === 'deepseek' && !p.includes('deepseek')) return false;
      if (provider === 'xai' && !p.includes('xai') && !p.includes('x-ai') && !id.includes('grok')) return false;
      if (provider === 'meta' && !p.includes('meta') && !id.includes('llama')) return false;
      if (provider === 'mistral' && !p.includes('mistral') && !id.includes('mistral') && !id.includes('codestral') && !id.includes('pixtral')) return false;
      if (provider === 'alibaba' && !p.includes('alibaba') && !id.includes('qwen') && !id.includes('qwq')) return false;
    }

    if (!query) return true;
    return (m.id && m.id.toLowerCase().includes(query)) ||
           (m.name && m.name.toLowerCase().includes(query)) ||
           (m.provider && m.provider.toLowerCase().includes(query)) ||
           (m.desc && m.desc.toLowerCase().includes(query));
  });

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
                Kelola API key, multi-key proxy pool, model pilihan, dan parameter generasi untuk roleplay.
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
                      className={`api-modal__btn ${aiEngine === 'puter' ? 'api-modal__btn--primary' : 'api-modal__btn--ghost'}`}
                      type="button"
                      onClick={() => setAiEngine('puter')}
                    >
                      Puter Proxy
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

                {/* Puter Proxy Engine */}
                {aiEngine === 'puter' && (
                  <>
                    {/* Multi-Key Pool Manager Card */}
                    <div className="puter-key-pool-card">
                      <div className="puter-key-pool-header">
                        <div className="puter-key-pool-title">
                          <span className="puter-key-icon">🔑</span>
                          <span>Multi-Key Pool (Anti-Limit Engine)</span>
                        </div>
                        <span className="puter-badge puter-badge--key-count">
                          {puterKeys.length} Key Terdaftar
                        </span>
                      </div>

                      {/* Key List Container */}
                      <div className="puter-key-list">
                        {puterKeys.length === 0 ? (
                          <div className="puter-key-empty">
                            <span>ℹ️ Belum ada Key khusus. Tambahkan beberapa token Puter di bawah untuk kapasitas 300+ pesan tanpa limit!</span>
                          </div>
                        ) : (
                          puterKeys.map((k) => {
                            const isActive = k.id === puterActiveKeyId;
                            const isLimited = k.status === 'limited';
                            const mask = k.token.length > 12 ? `${k.token.slice(0, 7)}...${k.token.slice(-4)}` : 'ptr-xxxx';
                            
                            return (
                              <div key={k.id} className={`puter-key-item ${isActive ? 'puter-key-item--active' : ''} ${isLimited ? 'puter-key-item--limited' : ''}`}>
                                <div className="puter-key-item__info">
                                  <span className={`puter-status-dot ${isActive ? 'puter-status-dot--active' : (isLimited ? 'puter-status-dot--limited' : 'puter-status-dot--ready')}`} />
                                  <span className="puter-key-item__label">{k.label}</span>
                                  <span className="puter-key-item__mask">({mask})</span>
                                </div>
                                <div className="puter-key-item__actions">
                                  {!isActive ? (
                                    <button
                                      className="puter-btn-action puter-btn-action--set"
                                      type="button"
                                      onClick={() => handleSetActivePuterKey(k.id)}
                                      title="Jadikan Key Aktif"
                                    >
                                      ✓ Gunakan
                                    </button>
                                  ) : (
                                    <span className="puter-active-tag">[AKTIF]</span>
                                  )}
                                  <button
                                    className="puter-btn-action puter-btn-action--del"
                                    type="button"
                                    onClick={() => handleRemovePuterKey(k.id)}
                                    title="Hapus Key"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add Key Input Row */}
                      <div className="puter-key-input-row">
                        <input
                          type="password"
                          className="api-modal__input puter-key-input"
                          placeholder="Paste Puter Token (ptr-xxxx)..."
                          value={newPuterKey}
                          onChange={(e) => setNewPuterKey(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddPuterKey();
                            }
                          }}
                        />
                        <button
                          className="api-modal__btn api-modal__btn--primary"
                          type="button"
                          onClick={() => handleAddPuterKey()}
                        >
                          + Tambah Key
                        </button>
                      </div>

                      {/* Quick Login / Grab Token Button */}
                      <div className="puter-quick-login-row">
                        <button
                          className="puter-quick-btn"
                          type="button"
                          onClick={handlePuterLogin}
                          disabled={isPuterLoggingIn}
                        >
                          ⚡ {isPuterLoggingIn ? 'Menghubungkan...' : (puterAuthUser ? `Gunakan Akun Login (@${puterAuthUser})` : 'Masuk Akun Puter (Ambil Token Otomatis)')}
                        </button>
                      </div>
                    </div>

                    {/* Model Selection Group (Interactive Button Trigger) */}
                    <div className="api-modal__field">
                      <label className="api-modal__label">Model AI Puter (500+ Model Tersedia)</label>
                      
                      {/* Clickable Model Selector Trigger Box */}
                      <div
                        className="puter-model-trigger-btn"
                        onClick={() => setIsModelCatalogOpen(true)}
                        role="button"
                        tabIndex={0}
                        title="Klik untuk membuka katalog dan memilih model AI"
                      >
                        <div className="puter-model-trigger-left">
                          <span className="puter-model-trigger-icon">
                            {PUTER_MODEL_METADATA[puterModel]?.icon || '✨'}
                          </span>
                          <div className="puter-model-trigger-info">
                            <span className="puter-model-trigger-name">
                              {PUTER_MODEL_METADATA[puterModel]?.name || puterModel}
                            </span>
                            <span className="puter-model-trigger-provider">
                              {PUTER_MODEL_METADATA[puterModel]?.provider || extractProvider(puterModel)}
                            </span>
                          </div>
                        </div>

                        <div className="puter-model-trigger-right">
                          <span className="puter-model-change-badge">
                            🔍 Ganti Model (500+)
                          </span>
                        </div>
                      </div>

                      {/* Custom Model Input Group */}
                      <div className="puter-custom-model-row">
                        <input
                          type="text"
                          className="api-modal__input"
                          placeholder="Atau ketik ID model manual... (contoh: openai/gpt-4o, deepseek-ai/deepseek-v3)"
                          value={customPuterModel}
                          onChange={(e) => setCustomPuterModel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCustomPuterModel();
                            }
                          }}
                        />
                        <button
                          className="api-modal__btn api-modal__btn--ghost"
                          type="button"
                          onClick={handleApplyCustomPuterModel}
                        >
                          Terapkan
                        </button>
                      </div>

                      <span className="api-modal__hint">
                        Klik tombol model di atas untuk mencari dan memilih dari 500+ model AI yang tersedia di katalog Puter.
                      </span>
                    </div>

                    {/* Puter SDK Status Card */}
                    <div className="puter-sdk-status-card">
                      <div className="puter-sdk-status-header">
                        <span className={`puter-status-dot ${puterSdkStatus === 'ready' ? 'puter-status-dot--active' : 'puter-status-dot--loading'}`} />
                        <span className="puter-sdk-status-title">
                          {puterSdkStatus === 'ready' ? 'Puter.js SDK Terhubung & Siap' : 'Menghubungkan ke Puter.js SDK...'}
                        </span>
                      </div>
                      <p className="puter-sdk-status-desc">
                        Akses 500+ AI models langsung dan aman melalui reverse proxy Puter. Tambahkan token di pool untuk anti-limit.
                      </p>
                    </div>
                  </>
                )}

                {/* Copilot Engine */}
                {aiEngine === 'copilot' && (
                  <>
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

                {/* Gravity Engine */}
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

                {/* 9Router Engine */}
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

      {/* Model Catalog Modal (500+ Models) */}
      {isModelCatalogOpen && (
        <div className="catalog-modal__overlay" onClick={() => setIsModelCatalogOpen(false)}>
          <div className="catalog-modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-modal__header">
              <div className="catalog-modal__title-group">
                <h3 className="catalog-modal__title">
                  <span>✨</span> Katalog Model AI Puter
                </h3>
                <span className="catalog-modal__count-badge">
                  {filteredCatalogModels.length} Model
                </span>
              </div>
              <button
                className="catalog-modal__close"
                type="button"
                onClick={() => setIsModelCatalogOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="catalog-modal__search-box">
              <span className="catalog-search-icon">🔍</span>
              <input
                type="text"
                className="catalog-modal__search-input"
                placeholder="Cari model berdasarkan nama, provider, atau kemampuan (contoh: claude-3-7, deepseek, vision)..."
                value={catalogSearchQuery}
                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                autoFocus
              />
              {catalogSearchQuery && (
                <button
                  className="catalog-search-clear"
                  type="button"
                  onClick={() => setCatalogSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Provider Filter Tabs */}
            <div className="catalog-modal__provider-tabs">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'anthropic', label: 'Anthropic' },
                { id: 'openai', label: 'OpenAI' },
                { id: 'google', label: 'Google' },
                { id: 'deepseek', label: 'DeepSeek' },
                { id: 'xai', label: 'xAI' },
                { id: 'meta', label: 'Meta AI' },
                { id: 'mistral', label: 'Mistral' },
                { id: 'alibaba', label: 'Alibaba' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`catalog-tab-btn ${catalogProviderFilter === tab.id ? 'catalog-tab-btn--active' : ''}`}
                  onClick={() => setCatalogProviderFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Model List Grid */}
            <div className="catalog-modal__list">
              {isCatalogLoading ? (
                <div className="catalog-loading">
                  <span className="catalog-spinner" />
                  <span>Memuat katalog model dari Puter...</span>
                </div>
              ) : filteredCatalogModels.length === 0 ? (
                <div className="catalog-empty">
                  <span>Tidak ada model yang cocok dengan pencarian "<strong>{catalogSearchQuery}</strong>"</span>
                  <button
                    className="api-modal__btn api-modal__btn--primary"
                    type="button"
                    style={{ marginTop: '12px' }}
                    onClick={() => {
                      handleSelectPuterModel(catalogSearchQuery);
                    }}
                  >
                    Gunakan "{catalogSearchQuery}" sebagai Custom Model
                  </button>
                </div>
              ) : (
                <div className="catalog-grid">
                  {filteredCatalogModels.map((m) => {
                    const isSelected = m.id === puterModel;
                    return (
                      <div
                        key={m.id}
                        className={`catalog-card ${isSelected ? 'catalog-card--selected' : ''}`}
                        onClick={() => handleSelectPuterModel(m.id)}
                      >
                        <div className="catalog-card__header">
                          <div className="catalog-card__title">
                            <span className="catalog-card__icon">{m.icon || '⚡'}</span>
                            <span className="catalog-card__name">{m.name}</span>
                          </div>
                          <span className="catalog-card__provider">{m.provider}</span>
                        </div>
                        <div className="catalog-card__id">{m.id}</div>
                        <div className="catalog-card__desc">{m.desc}</div>
                        {m.context && (
                          <div className="catalog-card__context">📊 {m.context}</div>
                        )}
                        <button
                          className={`catalog-card__btn ${isSelected ? 'catalog-card__btn--selected' : ''}`}
                          type="button"
                        >
                          {isSelected ? '✓ Terpilih' : 'Pilih Model'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
