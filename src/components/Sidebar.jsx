import { useState, useEffect } from 'react';
import './Sidebar.css';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function truncateMessage(text, maxLen = 30) {
  if (!text) return 'No messages yet';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

export default function Sidebar({ isOpen, onPersonalizationOpen, onToggle, onNavigate, conversationData, refreshTrigger }) {
  const [activeChat, setActiveChat] = useState(conversationData?.id || null);
  const [chatHistory, setChatHistory] = useState([]);

  const fetchConversations = () => {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        setChatHistory(data);
      })
      .catch(err => console.error("Error fetching conversations:", err));
  };

  useEffect(() => {
    fetchConversations();
  }, [refreshTrigger]);

  // Update active chat when conversationData changes
  useEffect(() => {
    if (conversationData?.id) {
      setActiveChat(conversationData.id);
      // Refresh conversations list when entering a chat
      fetchConversations();
    }
  }, [conversationData?.id]);

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeChat === id) {
          setActiveChat(null);
          if (onNavigate) onNavigate('home');
        }
        fetchConversations();
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleNewChat = async () => {
    if (conversationData?.characterId) {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId: conversationData.characterId })
        });
        const newConv = await res.json();
        if (onNavigate && newConv.id) {
          onNavigate('chat', newConv);
        }
      } catch (err) {
        console.error("Error creating new conversation:", err);
      }
    } else if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      <div className="sidebar__inner">
        {/* Logo / Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#g1)"/>
              <path d="M2 17l10 5 10-5" stroke="url(#g2)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M2 12l10 5 10-5" stroke="url(#g3)" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <defs>
                <linearGradient id="g1" x1="2" y1="7" x2="22" y2="7" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
                <linearGradient id="g2" x1="2" y1="17" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
                <linearGradient id="g3" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="sidebar__brand-name">Council AI</span>
          <button
            className={`sidebar__collapse ${isOpen ? 'sidebar__collapse--open' : 'sidebar__collapse--closed'}`}
            onClick={onToggle}
            aria-label={isOpen ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
            id="btn-collapse-sidebar"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <button className="sidebar__new-chat" id="btn-new-chat" onClick={handleNewChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Chat
        </button>

        {/* Chat History */}
        <div className="sidebar__section">
          <h3 className="sidebar__section-title">Recent Chats</h3>
          <ul className="sidebar__chat-list" id="chat-history-list">
            {chatHistory.length === 0 && (
              <li className="sidebar__chat-empty">
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', padding: '8px 12px', display: 'block' }}>
                  No conversations yet
                </span>
              </li>
            )}
            {chatHistory.map((chat) => (
              <li key={chat.id}>
                <button
                  className={`sidebar__chat-item ${activeChat === chat.id ? 'sidebar__chat-item--active' : ''}`}
                  onClick={() => {
                    setActiveChat(chat.id);
                    if (onNavigate) {
                      onNavigate('chat', chat);
                    }
                  }}
                  id={`chat-item-${chat.id}`}
                >
                  <div className="sidebar__chat-icon" style={{ overflow: 'hidden', padding: 0 }}>
                    <img src={chat.character?.avatar || '/ai_avatar.png'} alt={chat.character?.name || 'Character'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="sidebar__chat-info">
                    <span className="sidebar__chat-title">{chat.character?.name || 'Unknown Character'}</span>
                    <span className="sidebar__chat-time">
                      {truncateMessage(chat.messages?.[0]?.content)}
                    </span>
                  </div>
                  <span className="sidebar__chat-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {formatTimeAgo(chat.messages?.[0]?.createdAt)}
                    <button 
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center' }}
                      title="Delete Chat"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Menu */}
        <div className="sidebar__bottom">
          <button
            className="sidebar__menu-item"
            id="btn-personalization"
            onClick={onPersonalizationOpen}
          >
            <span className="sidebar__menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
            Personalization
          </button>
          
          {/* User Profile */}
          <div className="sidebar__user">
            <img src="/user_avatar.png" alt="User" className="sidebar__user-avatar" />
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">My Account</span>
              <span className="sidebar__user-status">
                <span className="sidebar__status-dot"></span>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
