import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import CharacterProfile from '../components/CharacterProfile';
import RightSidebar from '../components/RightSidebar';
import PersonalizationPanel from '../components/PersonalizationPanel';
import EditCharacterModal from '../components/EditCharacterModal';
import PersonaModal from '../components/PersonaModal';
import MemoryModal from '../components/MemoryModal';
import ScenarioModal from '../components/ScenarioModal';
import SideCharactersModal from '../components/SideCharactersModal';
import ApiSettingsModal from '../components/ApiSettingsModal';
import CardPopup from '../components/CardPopup';
import AvatarPopup from '../components/AvatarPopup';
import TimeModal from '../components/TimeModal';
import '../App.css';

const defaultSettings = {
  background: 'default',
  bubbleTheme: 'dark',
  bubbleRadius: 18,
  avatarSize: 40,
  font: 'Inter',
  fontSize: 14,
  accent: '#7c3aed',
};

const backgroundStyles = {
  default: { background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)' },
  midnight: { background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 100%)' },
  forest: { background: 'linear-gradient(135deg, #040d08 0%, #0a1810 100%)' },
  void: { background: '#000000' },
  nebula: { background: 'linear-gradient(135deg, #0d0618 0%, #18052e 50%, #050d18 100%)' },
  ocean: { background: 'linear-gradient(135deg, #020c1b 0%, #0a192f 100%)' },
  cherry: { background: 'linear-gradient(135deg, #1a0510 0%, #2d0a1e 50%, #150818 100%)' },
  aurora: { background: 'linear-gradient(135deg, #041020 0%, #071830 30%, #0a1018 70%, #060d22 100%)' },
  ember: { background: 'linear-gradient(135deg, #1a0805 0%, #201008 50%, #150a05 100%)' },
};

const bubbleThemes = {
  dark: { ai: '#1a1a25', user: '#f1f1f5', userText: '#0a0a0f', boldColor: '#eab308' },
  midnight: { ai: '#0d1117', user: '#e2e8f0', userText: '#0f172a', boldColor: '#38bdf8' },
  purple: { ai: '#1e1030', user: '#ddd6fe', userText: '#2e1065', boldColor: '#c084fc' },
  green: { ai: '#0d1a12', user: '#d1fae5', userText: '#064e3b', boldColor: '#4ade80' },
  monochrome: { ai: '#1c1c1c', user: '#e5e5e5', userText: '#171717', aiBorder: '1px solid rgba(255,255,255,0.12)', userBorder: 'none', aiAnimClass: 'anim-pulse-subtle', boldColor: '#a3a3a3' },
  
  neon_purple: { ai: '#0f0a1a', user: '#1a1028', userText: '#ffffff', aiBorder: '1px solid #9333ea', userBorder: '1px solid rgba(147,51,234,0.3)', boldColor: '#d8b4fe', aiAnimClass: 'anim-neon-purple', userAnimClass: 'anim-neon-purple' },
  neon_cyan: { ai: '#051015', user: '#0a1520', userText: '#ffffff', aiBorder: '1px solid #06b6d4', userBorder: '1px solid rgba(6,182,212,0.3)', boldColor: '#67e8f9', aiAnimClass: 'anim-neon-cyan', userAnimClass: 'anim-neon-cyan' },
  neon_rose: { ai: '#150810', user: '#1a0c15', userText: '#ffffff', aiBorder: '1px solid #e11d48', userBorder: '1px solid rgba(225,29,72,0.3)', boldColor: '#f9a8d4', aiAnimClass: 'anim-neon-rose', userAnimClass: 'anim-neon-rose' },
  neon_amber: { ai: '#151005', user: '#1a150a', userText: '#ffffff', aiBorder: '1px solid #d97706', userBorder: '1px solid rgba(217,119,6,0.3)', boldColor: '#fcd34d', aiAnimClass: 'anim-neon-amber', userAnimClass: 'anim-neon-amber' },

  glass_dark: { ai: 'rgba(255,255,255,0.04)', user: 'rgba(255,255,255,0.08)', userText: '#ffffff', aiBorder: '1px solid rgba(255,255,255,0.05)', userBorder: '1px solid rgba(255,255,255,0.1)', boldColor: '#94a3b8', aiAnimClass: 'anim-glass-shimmer', userAnimClass: 'anim-glass-shimmer' },
  glass_purple: { ai: 'rgba(139,92,246,0.08)', user: 'rgba(139,92,246,0.15)', userText: '#ffffff', aiBorder: '1px solid rgba(139,92,246,0.1)', userBorder: '1px solid rgba(139,92,246,0.25)', boldColor: '#c084fc', aiAnimClass: 'anim-glass-shimmer-purple', userAnimClass: 'anim-glass-shimmer-purple' },

  ocean: { ai: '#0a192f', user: '#112240', userText: '#ffffff', aiBorder: '1px solid rgba(100,255,218,0.15)', userBorder: '1px solid rgba(100,255,218,0.25)', aiAnimClass: 'anim-wave-ocean', userAnimClass: 'anim-wave-ocean', boldColor: '#2dd4bf' },
  sakura: { ai: '#1a0e14', user: '#2d1422', userText: '#ffffff', aiBorder: '1px solid rgba(236,72,153,0.3)', userBorder: '1px solid rgba(236,72,153,0.4)', aiAnimClass: 'anim-wave-sakura', userAnimClass: 'anim-wave-sakura', boldColor: '#f472b6' },
  sunset: { ai: '#1a0f08', user: '#261a0f', userText: '#ffffff', aiBorder: '1px solid rgba(251,146,60,0.35)', userBorder: '1px solid rgba(251,146,60,0.25)', aiAnimClass: 'anim-glow-sunset', userAnimClass: 'anim-glow-sunset', boldColor: '#fb923c' },
  
  spin_orange: { ai: '#1a0f08', user: '#261a0f', userText: '#ffffff', aiBorder: 'none', userBorder: 'none', aiAnimClass: 'anim-spin-snake anim-spin-orange', userAnimClass: 'anim-spin-snake anim-spin-orange', boldColor: '#fb923c' },
  spin_green: { ai: '#05140b', user: '#0a1f12', userText: '#ffffff', aiBorder: 'none', userBorder: 'none', aiAnimClass: 'anim-spin-snake anim-spin-green', userAnimClass: 'anim-spin-snake anim-spin-green', boldColor: '#4ade80' },
  spin_blue: { ai: '#060b17', user: '#0a1224', userText: '#ffffff', aiBorder: 'none', userBorder: 'none', aiAnimClass: 'anim-spin-snake anim-spin-blue', userAnimClass: 'anim-spin-snake anim-spin-blue', boldColor: '#38bdf8' },
  
  rgb_classic: { ai: '#0a0a0a', user: '#141414', userText: '#ffffff', aiBorder: 'none', userBorder: 'none', aiAnimClass: 'anim-spin-snake anim-spin-rgb', userAnimClass: 'anim-spin-snake anim-spin-rgb', boldColor: '#a855f7' },
  rgb_flow: { ai: '#0a0a0a', user: '#141414', userText: '#ffffff', aiBorder: 'none', userBorder: 'none', aiAnimClass: 'anim-flow-rgb', userAnimClass: 'anim-flow-rgb', boldColor: '#a855f7' },
  rgb_pulse: { ai: '#0a0a0a', user: '#141414', userText: '#ffffff', aiBorder: 'none', userBorder: 'none', aiAnimClass: 'anim-pulse-rgb', userAnimClass: 'anim-pulse-rgb', boldColor: '#a855f7' },
  rgb_neon: { ai: '#0a0a0a', user: '#141414', userText: '#ffffff', aiBorder: 'none', userBorder: 'none', aiAnimClass: 'anim-neon-rgb', userAnimClass: 'anim-neon-rgb', boldColor: '#a855f7' },
};

const initialMessages = [
  {
    id: 1,
    role: 'ai',
    content: 'Halo! Saya Council AI, siap membantu kamu. Ada yang bisa saya bantu hari ini? 🚀',
    time: '20:00',
  },
  {
    id: 2,
    role: 'user',
    content: 'Hei, bisakah kamu membantu saya membuat desain UI yang keren untuk aplikasi chatbot?',
    time: '20:01',
  },
  {
    id: 3,
    role: 'ai',
    content: 'Tentu! Berikut beberapa prinsip desain UI chatbot yang modern:\n\n• Gunakan dark mode dengan warna aksen yang menarik\n• Buat bubble chat yang jelas membedakan antara AI dan user\n• Tambahkan animasi halus untuk respon yang lebih hidup\n• Sidebar yang bisa disembunyikan untuk tampilan lebih luas\n\nApa ada preferensi warna atau style tertentu?',
    time: '20:01',
  },
];

export default function Chat({ onNavigate, conversationData }) {
  const characterData = conversationData?.character;
  const isDesktop = window.innerWidth > 1100;
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(isDesktop);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [editCharacterOpen, setEditCharacterOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [sideCharactersOpen, setSideCharactersOpen] = useState(false);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [activePersona, setActivePersona] = useState(null);
  const [avatarPopup, setAvatarPopup] = useState(null);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  
  const [roleplayTime, setRoleplayTime] = useState('12:00');
  const [roleplayDate, setRoleplayDate] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('personalizeSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const initialMessageIds = useRef(new Set());
  const initializedConvos = useRef(new Set());
  const skipInitialScrollRef = useRef(true);
  const [isReady, setIsReady] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [hasPersonas, setHasPersonas] = useState(true);
  const [personasLoaded, setPersonasLoaded] = useState(false);
  const [abortController, setAbortController] = useState(null);
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const lastSummarizedCount = useRef(0);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('personalizeSettings', JSON.stringify(settings));
  }, [settings]);

  // Load default persona
  useEffect(() => {
    fetch('/api/personas')
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          setHasPersonas(false);
        } else {
          setHasPersonas(true);
          const defaultId = localStorage.getItem('defaultPersonaId');
          if (defaultId) {
            const persona = data.find(p => p.id === defaultId);
            if (persona) {
              setActivePersona(persona);
            } else {
              setActivePersona(data[0]);
              localStorage.setItem('defaultPersonaId', data[0].id);
            }
          } else {
            setActivePersona(data[0]);
            localStorage.setItem('defaultPersonaId', data[0].id);
          }
        }
        setPersonasLoaded(true);
      })
      .catch(err => {
        console.error("Error fetching personas:", err);
        setPersonasLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (conversationData && conversationData.id) {
      fetch(`/api/messages/${conversationData.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setMessages(data);
            data.forEach(m => initialMessageIds.current.add(m.id));
          } else {
            const content = characterData.greeting || `Halo! Saya ${characterData.name}, siap membantu kamu. Ada yang bisa saya bantu hari ini?`;
            const greetingMsg = {
              id: 'greeting',
              role: 'ai',
              content: content,
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([greetingMsg]);
            initialMessageIds.current.add(greetingMsg.id);
            
            // Save initial greeting to DB only once per conversation ID
            if (!initializedConvos.current.has(conversationData.id)) {
              initializedConvos.current.add(conversationData.id);
              fetch(`/api/messages/${conversationData.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'ai', content: content })
              })
                .then(() => setSidebarRefreshTrigger(prev => prev + 1))
                .catch(err => console.error("Error saving greeting:", err));
            }
          }
        })
        .catch(err => console.error("Error fetching messages:", err));
    } else {
      setMessages(initialMessages);
      initialMessages.forEach(m => initialMessageIds.current.add(m.id));
    }
  }, [conversationData]);

  // Auto-summarization effect
  useEffect(() => {
    // Only trigger if we have a valid conversation and it's a multiple of 30
    if (messages.length > 0 && messages.length % 30 === 0 && messages.length > lastSummarizedCount.current && !isTyping && conversationData?.id) {
      const runAutoSummarize = async () => {
        setIsSummarizing(true);
        lastSummarizedCount.current = messages.length;
        
        try {
          const startIndex = messages.length - 30;
          const endIndex = messages.length - 1;
          
          const savedSettings = localStorage.getItem('apiSettings');
          const apiSettings = savedSettings ? JSON.parse(savedSettings) : {};

          const res = await fetch(`/api/chat/${conversationData.id}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startIndex, endIndex, activePersona, apiSettings })
          });
          
          if (res.ok) {
            showToast('Ringkasan otomatis berhasil disimpan ke Skenario!', 'success');
          } else {
            showToast('Gagal membuat ringkasan otomatis.', 'error');
          }
        } catch (err) {
          console.error("Auto summarize error:", err);
          showToast('Terjadi kesalahan saat meringkas.', 'error');
        } finally {
          setIsSummarizing(false);
        }
      };
      
      runAutoSummarize();
    }
  }, [messages, isTyping, conversationData, activePersona]);

  // Toggle handlers for mutual exclusion on mobile
  const toggleLeftSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (next && window.innerWidth <= 1100) {
        setRightSidebarOpen(false);
      }
      return next;
    });
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen((prev) => {
      const next = !prev;
      if (next && window.innerWidth <= 1100) {
        setSidebarOpen(false);
      }
      return next;
    });
  };

  // Remove no-transition class after first paint so interactions animate normally
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    });
  }, []);

  // Apply CSS vars when settings change
  useEffect(() => {
    if (conversationData?.id) {
      const savedTime = localStorage.getItem(`roleplayTime_${conversationData.id}`);
      const savedDate = localStorage.getItem(`roleplayDate_${conversationData.id}`);
      if (savedTime) setRoleplayTime(savedTime);
      if (savedDate) setRoleplayDate(savedDate);
    }
  }, [conversationData?.id]);

  useEffect(() => {
    const root = document.documentElement;
    const theme = bubbleThemes[settings.bubbleTheme] || bubbleThemes.dark;
    root.style.setProperty('--bubble-ai', theme.ai);
    root.style.setProperty('--bubble-user', theme.user);
    root.style.setProperty('--accent-primary', settings.accent);
    root.style.setProperty('--font-main', `'${settings.font}', sans-serif`);
  }, [settings]);

  useEffect(() => {
    if (skipInitialScrollRef.current) {
      skipInitialScrollRef.current = false;
      return;
    }

    const container = document.getElementById('chat-messages');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSettingsChange = (key, value) => {
    if (key === 'reset') {
      setSettings(defaultSettings);
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditCharacterSave = async (updatedData) => {
    if (!characterData?.id) return;
    try {
      const response = await fetch(`/api/characters/${characterData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedData.name,
          greeting: updatedData.greeting,
          shortDesc: updatedData.shortDesc,
          systemPrompt: updatedData.systemPrompt,
          personality: updatedData.personaStory,
          sampleDialog: updatedData.sampleDialog,
          avatar: updatedData.avatarPreview || characterData.avatar,
        })
      });
      if (response.ok) {
        const updatedCharacter = await response.json();
        setEditCharacterOpen(false);
        if (onNavigate) {
          onNavigate('chat', updatedCharacter);
        }
      }
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  const saveMessageToDb = async (role, content) => {
    if (!conversationData?.id) return;
    try {
      await fetch(`/api/messages/${conversationData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content })
      });
      setSidebarRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  };

  const refreshMessages = async () => {
    if (!conversationData?.id) return;
    try {
      const res = await fetch(`/api/messages/${conversationData.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => {
          const lastLocalAiMsg = prev.slice().reverse().find(m => m.role === 'ai');
          
          return data.map((serverMsg, index) => {
            let localMsg = prev.find(m => m.id === serverMsg.id);
            if (!localMsg) {
              localMsg = prev.find(m => m.role === serverMsg.role && m.content.trim() === serverMsg.content.trim());
            }
            
            // Foolproof fallback: if this is the last server message and it's AI, match it with the last local AI message
            if (!localMsg && serverMsg.role === 'ai' && index === data.length - 1) {
              localMsg = lastLocalAiMsg;
            }

            if (localMsg) {
              return { 
                ...serverMsg, 
                thoughtProcess: localMsg.thoughtProcess,
                startTime: localMsg.startTime,
                endTime: localMsg.endTime
              };
            }
            return serverMsg;
          });
        });
        data.forEach(m => initialMessageIds.current.add(m.id));
      }
    } catch (err) {
      console.error("Error refreshing messages:", err);
    }
  };

  const processStream = async (response, aiMsgId) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiText = '';
    let aiThought = '';
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          setMessages((prev) => prev.map(m => m.id === aiMsgId ? { ...m, isThinking: false, isGenerating: false, endTime: Date.now() } : m));
          setAbortController(null);
          break;
        }
        
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') {
              setSidebarRefreshTrigger(prev => prev + 1);
              continue;
            }
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.type === 'thought') {
                  aiThought += parsed.chunk;
                  setMessages((prev) => prev.map(m => m.id === aiMsgId ? { ...m, thoughtProcess: aiThought } : m));
                } else {
                  aiText += (parsed.chunk || '');
                  setMessages((prev) => prev.map(m => m.id === aiMsgId ? { ...m, content: aiText, isThinking: false } : m));
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted');
        setMessages((prev) => prev.map(m => m.id === aiMsgId ? { ...m, isThinking: false, isGenerating: false, endTime: Date.now() } : m));
      } else {
        console.error("Stream reading error:", err);
      }
      setAbortController(null);
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const content = inputValue.trim();
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    if (!conversationData?.id) return;

    try {
      const controller = new AbortController();
      setAbortController(controller);
      
      const savedSettings = localStorage.getItem('apiSettings');
      const apiSettings = savedSettings ? JSON.parse(savedSettings) : {};
      
      const response = await fetch(`/api/chat/${conversationData.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          activePersona, 
          apiSettings,
          timeContext: roleplayTime,
          dateContext: roleplayDate
        }),
        signal: controller.signal
      });
      
      if (!response.ok) throw new Error('Network response was not ok');

      // Increment time by 5 minutes
      if (roleplayTime) {
        try {
          const [hours, minutes] = roleplayTime.split(':').map(Number);
          let newMinutes = minutes + 5;
          let newHours = hours;
          if (newMinutes >= 60) {
            newMinutes -= 60;
            newHours = (newHours + 1) % 24;
          }
          const formattedTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
          setRoleplayTime(formattedTime);
          localStorage.setItem(`roleplayTime_${conversationData.id}`, formattedTime);
        } catch(e) {
          console.error("Error parsing time", e);
        }
      }

      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { 
        id: aiMsgId, 
        role: 'ai', 
        content: '', 
        thoughtProcess: '',
        isThinking: true,
        isGenerating: true,
        startTime: Date.now(),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
      }]);
      setIsTyping(false);

      await processStream(response, aiMsgId);
      await refreshMessages();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error during streaming:", err);
      }
      setIsTyping(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsTyping(false);
    }
  };

  const handleEdit = async (msgId, newContent) => {
    try {
      const msg = messages.find(m => m.id === msgId);
      if (!msg) return;
      
      await fetch(`/api/messages/${msgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: newContent } : m));
      
      if (msg.role === 'user') {
        await handleRegenerate(msgId);
      }
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await fetch(`/api/messages/${msgId}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleRegenerate = async (msgId) => {
    try {
      const msgIndex = messages.findIndex(m => m.id === msgId);
      if (msgIndex === -1) return;
      const msg = messages[msgIndex];
      
      let targetId = msgId;
      if (msg.role === 'user') {
        if (msgIndex + 1 < messages.length) {
          targetId = messages[msgIndex + 1].id;
        } else {
          targetId = null;
        }
      }
      
      if (targetId) {
        await fetch(`/api/messages/${targetId}?deleteAfter=true`, { method: 'DELETE' });
        const targetIndex = messages.findIndex(m => m.id === targetId);
        if (targetIndex !== -1) {
          setMessages(prev => prev.slice(0, targetIndex));
        }
      }
      
      setIsTyping(true);
      const controller = new AbortController();
      setAbortController(controller);
      
      const savedSettings = localStorage.getItem('apiSettings');
      const apiSettings = savedSettings ? JSON.parse(savedSettings) : {};
      
      const response = await fetch(`/api/chat/${conversationData.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: '', 
          activePersona, 
          apiSettings,
          timeContext: roleplayTime,
          dateContext: roleplayDate
        }),
        signal: controller.signal
      });
      
      if (!response.ok) throw new Error('Network response was not ok');

      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { 
        id: aiMsgId, 
        role: 'ai', 
        content: '', 
        thoughtProcess: '',
        isThinking: true,
        isGenerating: true,
        startTime: Date.now(),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
      }]);
      setIsTyping(false);

      await processStream(response, aiMsgId);
      await refreshMessages();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error regenerating:", err);
      }
      setIsTyping(false);
      setAbortController(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  let chatBg = backgroundStyles[settings.background] || backgroundStyles.default;
  if (settings.background === 'custom' && settings.customBgUrl) {
    const opacity = settings.bgOverlayOpacity !== undefined ? settings.bgOverlayOpacity : 0.5;
    chatBg = {
      backgroundImage: `linear-gradient(rgba(0,0,0,${opacity}), rgba(0,0,0,${opacity})), url(${settings.customBgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  }

  const bubbleTheme = bubbleThemes[settings.bubbleTheme] || bubbleThemes.dark;
  
  const charName = characterData?.name || 'Council AI';
  const charAvatar = characterData?.avatar || '/ai_avatar.png';

  if (!characterData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <h2>Conversation Not Found</h2>
        <p>There was an error loading the conversation data.</p>
        <button onClick={() => onNavigate('home')} style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className={`app ${!isReady ? 'no-transition' : ''}`} style={{ 
      '--bubble-ai': bubbleTheme.ai, 
      '--bubble-user': bubbleTheme.user, 
      '--bubble-user-text': bubbleTheme.userText || '#0a0a0f', 
      '--bubble-ai-border': bubbleTheme.aiBorder || '1px solid var(--border-subtle)', 
      '--bubble-user-border': bubbleTheme.userBorder || 'none',
      '--text-bold-color': bubbleTheme.boldColor || '#eab308',
      '--avatar-size': `${settings.avatarSize || 40}px`,
      '--font-size': `${settings.fontSize || 14.5}px`,
      '--font-family': settings.font || 'Inter',
      fontFamily: settings.font || 'Inter'
    }}>
      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onPersonalizationOpen={() => {
          setPersonalizationOpen(true);
          setSidebarOpen(false);
        }}
        onToggle={toggleLeftSidebar}
        onNavigate={onNavigate}
        conversationData={conversationData}
        refreshTrigger={sidebarRefreshTrigger}
      />



      {/* Main Chat Area */}
      <main className={`chat-main ${rightSidebarOpen ? 'chat-main--rsidebar-open' : ''}`} style={chatBg}>
        {/* Background decoration */}
        <div className="chat-main__bg-orb chat-main__bg-orb--1" style={{ background: `radial-gradient(circle, ${settings.accent}18 0%, transparent 70%)` }} />
        <div className="chat-main__bg-orb chat-main__bg-orb--2" />

        {/* Top Header */}
        <header className="chat-header">
          <div className="chat-header__left">
            <button
              className="chat-header__action"
              onClick={() => onNavigate('home')}
              aria-label="Back to Home"
              style={{ marginRight: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <button
              className="chat-header__toggle"
              id="btn-toggle-sidebar"
              onClick={toggleLeftSidebar}
              aria-label="Toggle sidebar"
            >
              <div className={`hamburger ${sidebarOpen ? 'hamburger--open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>

            <div className="chat-header__identity">
              <div className="chat-header__avatar-wrap">
                <img src={charAvatar} alt={charName} className="chat-header__avatar" />
                <span className="chat-header__online-dot"></span>
              </div>
              <div className="chat-header__info">
                <h1 className="chat-header__name">{charName}</h1>
                <p className="chat-header__status">
                  <span className="chat-header__status-pulse"></span>
                  Online · Siap membantu
                </p>
              </div>
            </div>
          </div>

          <div className="chat-header__right">
            <button 
              className="chat-header__action" 
              id="btn-time" 
              aria-label="Waktu Roleplay"
              onClick={() => setTimeModalOpen(true)}
              title="Atur Waktu & Tanggal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
            <button
              className="chat-header__action"
              id="btn-open-rsidebar"
              aria-label="Character settings"
              onClick={toggleRightSidebar}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages" id="chat-messages">
          <div className="chat-messages__inner">
            {/* Character Profile at top */}
            <CharacterProfile characterData={characterData} />

            {messages.map((msg, index) => (
              <ChatMessage 
                key={msg.id} 
                message={msg}
                seqId={index + 1}
                animate={!initialMessageIds.current.has(msg.id)} 
                charName={charName}
                charAvatar={charAvatar}
                userName={activePersona?.name}
                userAvatar={activePersona?.avatar}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRegenerate={handleRegenerate}
                bubbleTheme={bubbleTheme}
                onAvatarClick={(data) => {
                  setAvatarPopup({
                    ...data,
                    themeClass: data.isUser ? (bubbleTheme.userAnimClass || '') : (bubbleTheme.aiAnimClass || '')
                  });
                }}
              />
            ))}
            {isTyping && (
              <ChatMessage
                message={{ id: 'typing', role: 'ai', content: '', time: '' }}
                isTyping={true}
                animate={true}
                charName={charName}
                charAvatar={charAvatar}
                userName={activePersona?.name}
                userAvatar={activePersona?.avatar}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="chat-input-wrap">
          <div className={`chat-input ${bubbleTheme.userAnimClass || ''}`}>
            <textarea
              ref={inputRef}
              className="chat-input__textarea"
              id="chat-textarea"
              placeholder={isSummarizing ? "Sistem sedang meringkas cerita..." : (!hasPersonas && personasLoaded) ? "Buat Persona terlebih dahulu untuk mulai chat..." : "Type your message..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping || isSummarizing || (!hasPersonas && personasLoaded)}
              rows="1"
              style={{ fontSize: `${settings.fontSize}px` }}
            />
            {abortController ? (
              <button
                className="chat-input__send chat-input__send--active"
                onClick={handleStop}
                aria-label="Stop generation"
                title="Stop Generation"
                style={{ background: '#e11d48' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                </svg>
              </button>
            ) : (
              <button
                className={`chat-input__send ${inputValue.trim() ? 'chat-input__send--active' : ''}`}
                id="btn-send"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping || isSummarizing || (!hasPersonas && personasLoaded)}
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            )}
          </div>
          <div className="chat-input__note">
            Gunakan <strong>Shift+Enter</strong> untuk membuat baris baru. Tekan <strong>Enter</strong> untuk mengirim.
          </div>
        </div>
      </main>



      {/* Right Sidebar - Character Settings */}
      <RightSidebar
        isOpen={rightSidebarOpen}
        onClose={() => setRightSidebarOpen(false)}
        onEditCharacterOpen={() => {
          setEditCharacterOpen(true);
          setRightSidebarOpen(false);
        }}
        onChoosePersonaOpen={() => {
          setPersonaOpen(true);
          setRightSidebarOpen(false);
        }}
        onEditMemoryOpen={() => {
          setMemoryOpen(true);
          setRightSidebarOpen(false);
        }}
        onScenarioOpen={() => {
          setScenarioOpen(true);
          setRightSidebarOpen(false);
        }}
        onSideCharactersOpen={() => {
          setSideCharactersOpen(true);
          setRightSidebarOpen(false);
        }}
        onApiSettingsOpen={() => {
          setApiSettingsOpen(true);
          setRightSidebarOpen(false);
        }}
      />

      {/* Personalization Panel */}
      <PersonalizationPanel
        isOpen={personalizationOpen}
        onClose={() => setPersonalizationOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <EditCharacterModal
        isOpen={editCharacterOpen}
        onClose={() => setEditCharacterOpen(false)}
        data={characterData}
        onSave={handleEditCharacterSave}
      />

      <PersonaModal
        isOpen={personaOpen}
        onClose={() => setPersonaOpen(false)}
        onSave={setActivePersona}
      />

      <MemoryModal 
        isOpen={memoryOpen} 
        onClose={() => setMemoryOpen(false)}
        characterId={conversationData?.characterId}
      />

      <ScenarioModal
        isOpen={scenarioOpen}
        onClose={() => setScenarioOpen(false)}
        characterId={conversationData?.characterId}
        conversationId={conversationData?.id}
        roleplayDate={roleplayDate}
        roleplayTime={roleplayTime}
      />

      <SideCharactersModal
        isOpen={sideCharactersOpen}
        onClose={() => setSideCharactersOpen(false)}
        characterId={conversationData?.characterId}
      />

      <ApiSettingsModal
        isOpen={apiSettingsOpen}
        onClose={() => setApiSettingsOpen(false)}
      />

      {/* Avatar Popup */}
      <AvatarPopup 
        data={avatarPopup} 
        onClose={() => setAvatarPopup(null)} 
      />

      {/* Time Settings Modal */}
      <TimeModal
        isOpen={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
        initialTime={roleplayTime}
        initialDate={roleplayDate}
        onSave={(data) => {
          setRoleplayTime(data.time);
          setRoleplayDate(data.date);
          if (conversationData?.id) {
            localStorage.setItem(`roleplayTime_${conversationData.id}`, data.time);
            localStorage.setItem(`roleplayDate_${conversationData.id}`, data.date);
          }
        }}
      />

    {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toastMessage.type === 'error' ? '#e11d48' : '#10b981',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {toastMessage.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          {toastMessage.message}
        </div>
      )}

      {isSummarizing && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-panel)',
          border: '1px solid var(--accent)',
          padding: '8px 16px',
          borderRadius: '20px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          color: 'var(--text-primary)',
          fontSize: '14px'
        }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid rgba(124,58,237,0.3)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Sistem sedang meringkas cerita...
        </div>
      )}
    </div>
  );
}
