import { useState } from 'react';
import './RightSidebar.css';

const menuItems = [
  {
    id: 'edit-character',
    label: 'Edit Karakter',
    desc: 'Ubah detail karakter AI',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  },
  {
    id: 'choose-persona',
    label: 'Pilih Persona',
    desc: 'Ganti gaya bicara karakter',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  },
  {
    id: 'edit-memory',
    label: 'Edit Memory',
    desc: 'Kelola ingatan karakter',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
        <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
        <line x1="17" y1="17" x2="22" y2="17"/>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
  {
    id: 'current-scenario',
    label: 'Skenario Saat Ini',
    desc: 'Atur alur cerita aktif',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  },
  {
    id: 'side-characters',
    label: 'Karakter Sampingan',
    desc: 'Tambah karakter pendukung',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
  },
  {
    id: 'api-settings',
    label: 'API Settings',
    desc: 'Konfigurasi koneksi API',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  },
];

export default function RightSidebar({
  isOpen,
  onClose,
  onEditCharacterOpen,
  onChoosePersonaOpen,
  onEditMemoryOpen,
  onScenarioOpen,
  onSideCharactersOpen,
  onApiSettingsOpen,
}) {
  const [activeMenu, setActiveMenu] = useState('edit-character');
  const handleMenuClick = (itemId) => {
    setActiveMenu(itemId);
    if (itemId === 'edit-character' && onEditCharacterOpen) {
      onEditCharacterOpen();
    }
    if (itemId === 'choose-persona' && onChoosePersonaOpen) {
      onChoosePersonaOpen();
    }
    if (itemId === 'edit-memory' && onEditMemoryOpen) {
      onEditMemoryOpen();
    }
    if (itemId === 'current-scenario' && onScenarioOpen) {
      onScenarioOpen();
    }
    if (itemId === 'side-characters' && onSideCharactersOpen) {
      onSideCharactersOpen();
    }
    if (itemId === 'api-settings' && onApiSettingsOpen) {
      onApiSettingsOpen();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`rsidebar-overlay ${isOpen ? 'rsidebar-overlay--visible' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`rsidebar ${isOpen ? 'rsidebar--open' : ''}`} id="right-sidebar">
        <div className="rsidebar__inner">
          {/* Header */}
          <div className="rsidebar__header">
            <div className="rsidebar__title">
              <div className="rsidebar__title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#rsg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="rsg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7c3aed"/>
                      <stop offset="1" stopColor="#06b6d4"/>
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <span>Pengaturan Karakter</span>
            </div>
            <button className="rsidebar__close" onClick={onClose} id="btn-close-rsidebar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="rsidebar__scroll">
            <div className="rsidebar__menu">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  className={`rsidebar__item ${activeMenu === item.id ? 'rsidebar__item--active' : ''}`}
                  id={`btn-${item.id}`}
                  style={{ animationDelay: isOpen ? `${index * 0.06}s` : '0s' }}
                  onClick={() => handleMenuClick(item.id)}
                  type="button"
                >
                  <div className="rsidebar__item-icon" style={{ background: item.gradient }}>
                    {item.icon}
                  </div>
                  <div className="rsidebar__item-info">
                    <span className="rsidebar__item-label">{item.label}</span>
                    <span className="rsidebar__item-desc">{item.desc}</span>
                  </div>
                  <svg className="rsidebar__item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Footer hint */}
          <div className="rsidebar__footer">
            <div className="rsidebar__footer-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Fitur-fitur ini sedang dalam pengembangan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
