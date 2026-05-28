import React, { useState, useEffect } from 'react';
import './Home.css';
import CardPopup from '../components/CardPopup';
import EditCharacterModal from '../components/EditCharacterModal';
import EditPersonaModal from '../components/EditPersonaModal';

export default function Home({ onNavigate }) {
  const isDesktop = window.innerWidth > 900;
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [popupData, setPopupData] = useState(null);
  const [popupType, setPopupType] = useState(null); // 'character' or 'persona'
  const [aiCharacters, setAiCharacters] = useState([]);
  const [userPersonas, setUserPersonas] = useState([]);
  const [isEditCharacterOpen, setIsEditCharacterOpen] = useState(false);
  const [isEditPersonaOpen, setIsEditPersonaOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const charRes = await fetch('/api/characters');
      const charData = await charRes.json();
      if (Array.isArray(charData)) {
        setAiCharacters(charData);
      } else {
        console.error("Failed to load characters:", charData);
      }

      const persRes = await fetch('/api/personas');
      const persData = await persRes.json();
      if (Array.isArray(persData)) {
        setUserPersonas(persData);
      } else {
        console.error("Failed to load personas:", persData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, type) => {
    setIsDeleting(true);
    try {
      const endpoint = type === 'character' ? `/api/characters/${id}` : `/api/personas/${id}`;
      const response = await fetch(`${endpoint}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPopupData(null);
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditCharacterSave = async (updatedData) => {
    try {
      const response = await fetch(`/api/characters/${popupData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedData.name,
          greeting: updatedData.greeting,
          shortDesc: updatedData.shortDesc,
          systemPrompt: updatedData.systemPrompt,
          personality: updatedData.personaStory,
          sampleDialog: updatedData.sampleDialog,
          avatar: updatedData.avatarPreview || popupData.avatar,
        })
      });
      if (response.ok) {
        setIsEditCharacterOpen(false);
        setPopupData(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  const handleEditPersonaSave = async (updatedData) => {
    try {
      const response = await fetch(`/api/personas/${popupData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedData.name,
          role: updatedData.role,
          description: updatedData.description,
          avatar: updatedData.avatarPreview || popupData.avatar,
        })
      });
      if (response.ok) {
        setIsEditPersonaOpen(false);
        setPopupData(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error updating persona:", error);
    }
  };

  return (
    <div className="home-container">
      {/* Sidebar for Home */}
      <aside className={`home-sidebar ${sidebarOpen ? 'home-sidebar--open' : 'home-sidebar--closed'}`}>
        <div className="home-sidebar__brand">
          <div className="home-sidebar__brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          {sidebarOpen && <span className="home-sidebar__brand-text">Council AI</span>}
          {sidebarOpen && (
            <button 
              className="home-sidebar__close-btn" 
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="home-sidebar__menu">
          <button className="home-sidebar__btn home-sidebar__btn--primary" onClick={() => onNavigate('create-character')}>
            <span className="home-sidebar__btn-icon">+</span>
            {sidebarOpen && <span>Create New Character</span>}
          </button>
          
          <button className="home-sidebar__btn home-sidebar__btn--secondary" onClick={() => onNavigate('create-persona')}>
            <span className="home-sidebar__btn-icon">+</span>
            {sidebarOpen && <span>New Persona</span>}
          </button>

          <div className="home-sidebar__divider"></div>

          <button className="home-sidebar__btn">
            <svg className="home-sidebar__btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            {sidebarOpen && <span>Explore Community</span>}
          </button>
          
          <button className="home-sidebar__btn">
            <svg className="home-sidebar__btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
        

      </aside>

      {/* Main Content */}
      <main className="home-main">
        <header className="home-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <button
              className="chat-header__toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <div className={`hamburger ${sidebarOpen ? 'hamburger--open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
            <h1 className="home-header__title" style={{ marginBottom: 0 }}>Welcome back!</h1>
            {isLoading && <span style={{ marginLeft: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>Loading...</span>}
          </div>
          <p className="home-header__subtitle">Who would you like to talk to today?</p>
        </header>

        <section className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">Your AI Characters</h2>
            <button className="home-section__view-all">View All</button>
          </div>
          <div className="home-grid">
            {aiCharacters.map(char => (
              <div 
                key={char.id} 
                className="char-card" 
                onClick={() => {
                  setPopupData(char);
                  setPopupType('character');
                }}
                style={{ '--card-color': char.color }}
              >
                <div className="char-card__image-container">
                  <img src={char.avatar} alt={char.name} className="char-card__image" />
                </div>

                <div className="char-card__body">
                  <div className="char-card__name-bottom">{char.name}</div>
                  <div className="char-card__desc" dangerouslySetInnerHTML={{ __html: char.shortDesc || '' }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section home-section--personas">
          <div className="home-section__header">
            <h2 className="home-section__title">Your Personas</h2>
          </div>
          <div className="home-grid">
            {userPersonas.map(persona => (
              <div 
                key={persona.id} 
                className="char-card"
                onClick={() => {
                  setPopupData(persona);
                  setPopupType('persona');
                }}
                style={{ '--card-color': persona.color }}
              >
                <div className="char-card__image-container">
                  <img src={persona.avatar} alt={persona.name} className="char-card__image" />
                </div>

                <div className="char-card__body">
                  <div className="char-card__name-bottom">{persona.name}</div>
                  <div className="char-card__desc">{persona.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Loading Overlay for Delete */}
        {isDeleting && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-panel)', padding: '20px 40px', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>
              Deleting...
            </div>
          </div>
        )}
      </main>

      {/* Popup Overlay */}
      {popupData && (
        <CardPopup 
          data={popupData} 
          type={popupType} 
          onClose={() => setPopupData(null)} 
          onNavigate={onNavigate}
          onDelete={() => handleDelete(popupData.id, popupType)}
          onEditCharacter={() => setIsEditCharacterOpen(true)}
          onEditPersona={() => setIsEditPersonaOpen(true)}
        />
      )}

      {/* Edit Character Modal */}
      {popupType === 'character' && popupData && (
        <EditCharacterModal
          isOpen={isEditCharacterOpen}
          onClose={() => setIsEditCharacterOpen(false)}
          data={popupData}
          onSave={handleEditCharacterSave}
        />
      )}

      {/* Edit Persona Modal */}
      {popupType === 'persona' && popupData && (
        <EditPersonaModal
          isOpen={isEditPersonaOpen}
          onClose={() => setIsEditPersonaOpen(false)}
          data={popupData}
          onSave={handleEditPersonaSave}
        />
      )}
    </div>
  );
}
