import React, { useState, useEffect, useCallback } from 'react';
import Home from './pages/Home';
import Chat from './pages/Chat';
import CreateCharacter from './pages/CreateCharacter';
import CreatePersona from './pages/CreatePersona';
import './App.css';

function parseHash() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const [view, ...rest] = hash.split('/');
  const id = rest.join('/') || null;
  return { view, id };
}

export default function App() {
  const [currentView, setCurrentView] = useState(() => parseHash().view);
  const [viewData, setViewData] = useState(() => {
    // Try to restore viewData from sessionStorage on initial load
    const saved = sessionStorage.getItem('chatbot_viewData');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Restore conversation data from the server if we have an ID in the hash but no viewData
  useEffect(() => {
    const { view, id } = parseHash();
    if (view === 'chat' && id && !viewData) {
      setLoading(true);
      fetch(`/api/conversations/${id}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setViewData(data);
            sessionStorage.setItem('chatbot_viewData', JSON.stringify(data));
          } else {
            // Conversation not found, go home
            window.location.hash = 'home';
          }
        })
        .catch(() => {
          window.location.hash = 'home';
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleNavigate = useCallback((view, data = null) => {
    setCurrentView(view);
    setViewData(data);

    if (data && data.id) {
      sessionStorage.setItem('chatbot_viewData', JSON.stringify(data));
      window.location.hash = `${view}/${data.id}`;
    } else {
      sessionStorage.removeItem('chatbot_viewData');
      window.location.hash = view;
    }
  }, []);

  // Listen to hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const { view, id } = parseHash();
      setCurrentView(view);

      if (view === 'chat' && id) {
        const saved = sessionStorage.getItem('chatbot_viewData');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.id === id) {
            setViewData(parsed);
            return;
          }
        }
        // Fetch from server if not in sessionStorage
        fetch(`/api/conversations/${id}`, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => {
            if (data && data.id) {
              setViewData(data);
              sessionStorage.setItem('chatbot_viewData', JSON.stringify(data));
            }
          })
          .catch(() => {
            window.location.hash = 'home';
          });
      } else {
        setViewData(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)',
        color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid rgba(124,58,237,0.3)',
            borderTop: '3px solid #7c3aed', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px'
          }} />
          Loading...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {currentView === 'home' && <Home onNavigate={handleNavigate} />}
      {currentView === 'chat' && <Chat onNavigate={handleNavigate} conversationData={viewData} />}
      {currentView === 'create-character' && <CreateCharacter onNavigate={handleNavigate} />}
      {currentView === 'create-persona' && <CreatePersona onNavigate={handleNavigate} />}
    </>
  );
}
