import { useState } from 'react';
import './PersonalizationPanel.css';

const fontOptions = ['Inter', 'Outfit', 'Roboto', 'Poppins', 'JetBrains Mono'];
const backgroundOptions = [
  { id: 'default', label: 'Default Dark', value: 'default', preview: 'linear-gradient(135deg, #0a0a0f 0%, #111118 100%)' },
  { id: 'midnight', label: 'Midnight Blue', value: 'midnight', preview: 'linear-gradient(135deg, #050d1a 0%, #0a1628 100%)' },
  { id: 'forest', label: 'Deep Forest', value: 'forest', preview: 'linear-gradient(135deg, #040d08 0%, #0a1810 100%)' },
  { id: 'void', label: 'Pure Void', value: 'void', preview: 'linear-gradient(135deg, #000000 0%, #0d0d0d 100%)' },
  { id: 'nebula', label: 'Nebula', value: 'nebula', preview: 'linear-gradient(135deg, #0d0618 0%, #18052e 50%, #050d18 100%)' },
  { id: 'ocean', label: 'Deep Ocean', value: 'ocean', preview: 'linear-gradient(135deg, #020c1b 0%, #0a192f 100%)' },
  { id: 'cherry', label: 'Cherry Night', value: 'cherry', preview: 'linear-gradient(135deg, #1a0510 0%, #2d0a1e 50%, #150818 100%)' },
  { id: 'aurora', label: 'Aurora', value: 'aurora', preview: 'linear-gradient(135deg, #041020 0%, #071830 30%, #0a1018 70%, #060d22 100%)' },
  { id: 'ember', label: 'Ember', value: 'ember', preview: 'linear-gradient(135deg, #1a0805 0%, #201008 50%, #150a05 100%)' },
];

const accentColors = [
  { id: 'purple', label: 'Violet', value: '#7c3aed' },
  { id: 'cyan', label: 'Cyan', value: '#06b6d4' },
  { id: 'rose', label: 'Rose', value: '#e11d48' },
  { id: 'amber', label: 'Amber', value: '#f59e0b' },
  { id: 'emerald', label: 'Emerald', value: '#10b981' },
  { id: 'white', label: 'Pure', value: '#f1f1f5' },
  { id: 'pink', label: 'Pink', value: '#ec4899' },
  { id: 'sky', label: 'Sky', value: '#0ea5e9' },
  { id: 'lime', label: 'Lime', value: '#84cc16' },
  { id: 'orange', label: 'Orange', value: '#f97316' },
];

const bubbleColorGroups = [
  {
    label: '🎨 Classic',
    items: [
      { id: 'dark', label: 'Dark', ai: '#1a1a25', user: '#f1f1f5', desc: 'Gelap klasik' },
      { id: 'midnight', label: 'Midnight', ai: '#0d1117', user: '#e2e8f0', desc: 'Biru tengah malam' },
      { id: 'purple', label: 'Purple', ai: '#1e1030', user: '#ddd6fe', desc: 'Ungu lembut' },
      { id: 'green', label: 'Forest', ai: '#0d1a12', user: '#d1fae5', desc: 'Hijau hutan' },
      { id: 'monochrome', label: 'Monochrome', ai: '#1c1c1c', user: '#e5e5e5', desc: 'Hitam putih' },
    ]
  },
  {
    label: '✨ Neon Border',
    items: [
      { id: 'neon_purple', label: 'Neon Purple', ai: '#0f0a1a', user: '#1a1028', desc: 'Glow ungu', border: true },
      { id: 'neon_cyan', label: 'Neon Cyan', ai: '#051015', user: '#0a1520', desc: 'Glow biru', border: true },
      { id: 'neon_rose', label: 'Neon Rose', ai: '#150810', user: '#1a0c15', desc: 'Glow merah muda', border: true },
      { id: 'neon_amber', label: 'Neon Amber', ai: '#151005', user: '#1a150a', desc: 'Glow kuning', border: true },
    ]
  },
  {
    label: '🪟 Glassmorphism',
    items: [
      { id: 'glass_dark', label: 'Glass Dark', ai: 'rgba(255,255,255,0.04)', user: 'rgba(255,255,255,0.08)', desc: 'Transparan gelap', border: true },
      { id: 'glass_purple', label: 'Glass Purple', ai: 'rgba(139,92,246,0.08)', user: 'rgba(139,92,246,0.15)', desc: 'Transparan ungu', border: true },
    ]
  },
  {
    label: '🌸 Aesthetic',
    items: [
      { id: 'ocean', label: 'Ocean', ai: '#0a192f', user: '#112240', desc: 'Laut dalam', border: true },
      { id: 'sakura', label: 'Sakura', ai: '#1a0e14', user: '#2d1422', desc: 'Bunga sakura', border: true },
      { id: 'sunset', label: 'Sunset', ai: '#1a0f08', user: '#261a0f', desc: 'Senja hangat', border: true },
    ]
  },
  {
    label: '🔥 Cyber Spin',
    items: [
      { id: 'spin_orange', label: 'Spin Orange', ai: '#1a0f08', user: '#261a0f', desc: 'Border muter oranye', border: true },
      { id: 'spin_green', label: 'Spin Green', ai: '#05140b', user: '#0a1f12', desc: 'Border muter hijau', border: true },
      { id: 'spin_blue', label: 'Spin Blue', ai: '#060b17', user: '#0a1224', desc: 'Border muter biru', border: true },
    ]
  },
  {
    label: '🌈 RGB Gamer',
    items: [
      { id: 'rgb_classic', label: 'RGB Spin', ai: '#0a0a0a', user: '#141414', desc: 'RGB muter', border: true },
      { id: 'rgb_flow', label: 'RGB Flow', ai: '#0a0a0a', user: '#141414', desc: 'RGB mengalir lurus', border: true },
      { id: 'rgb_pulse', label: 'RGB Pulse', ai: '#0a0a0a', user: '#141414', desc: 'RGB berdenyut', border: true },
      { id: 'rgb_neon', label: 'RGB Neon', ai: '#0a0a0a', user: '#141414', desc: 'Glow tebal', border: true },
    ]
  }
];

export default function PersonalizationPanel({ isOpen, onClose, settings, onSettingsChange }) {
  const [activeTab, setActiveTab] = useState('background');

  const tabs = [
    { id: 'background', label: 'Background', icon: '🌌' },
    { id: 'bubbles', label: 'Bubbles', icon: '💬' },
    { id: 'typography', label: 'Typography', icon: '✍️' },
    { id: 'accent', label: 'Accent', icon: '🎨' },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image to fit 1920x1080 bounds max to save localStorage space
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 1920;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onSettingsChange('customBgUrl', dataUrl);
        onSettingsChange('background', 'custom');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`personalization-overlay ${isOpen ? 'personalization-overlay--visible' : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`personalization-panel ${isOpen ? 'personalization-panel--open' : ''}`} id="personalization-panel">
        <div className="personalization-panel__header">
          <div className="personalization-panel__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#pg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="pg1" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>Personalization</span>
          </div>
          <button className="personalization-panel__close" onClick={onClose} id="btn-close-personalization">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="personalization-panel__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`personalization-panel__tab ${activeTab === tab.id ? 'personalization-panel__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="personalization-panel__content">

          {/* Background Tab */}
          {activeTab === 'background' && (
            <div className="personalization-section">
              <h4 className="personalization-section__title">Chat Background</h4>
              <div className="bg-options">
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.id}
                    className={`bg-option ${settings.background === bg.value ? 'bg-option--active' : ''}`}
                    onClick={() => onSettingsChange('background', bg.value)}
                    id={`bg-${bg.id}`}
                  >
                    <div
                      className="bg-option__preview"
                      style={{ background: bg.preview }}
                    />
                    <span className="bg-option__label">{bg.label}</span>
                    {settings.background === bg.value && (
                      <span className="bg-option__check">✓</span>
                    )}
                  </button>
                ))}
                
                {/* Custom Upload Button */}
                <label className={`bg-option ${settings.background === 'custom' ? 'bg-option--active' : ''}`} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  <div className="bg-option__preview" style={{ background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                    {settings.customBgUrl ? (
                       <div style={{ width: '100%', height: '100%', background: `url(${settings.customBgUrl}) center/cover` }}></div>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    )}
                  </div>
                  <span className="bg-option__label">Custom Image</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  {settings.background === 'custom' && (
                    <span className="bg-option__check">✓</span>
                  )}
                </label>
              </div>

              {settings.background === 'custom' && (
                <>
                  <h4 className="personalization-section__title" style={{ marginTop: 24 }}>Background Darkness (Overlay)</h4>
                  <div className="slider-wrap">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.bgOverlayOpacity !== undefined ? settings.bgOverlayOpacity * 100 : 50}
                      onChange={(e) => onSettingsChange('bgOverlayOpacity', Number(e.target.value) / 100)}
                      className="slider"
                      style={{ '--val': `${settings.bgOverlayOpacity !== undefined ? settings.bgOverlayOpacity * 100 : 50}%` }}
                    />
                    <span className="slider-value">{Math.round((settings.bgOverlayOpacity !== undefined ? settings.bgOverlayOpacity : 0.5) * 100)}%</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bubbles Tab */}
          {activeTab === 'bubbles' && (
            <div className="personalization-section">
              {bubbleColorGroups.map((group) => (
                <div key={group.label} style={{ marginBottom: '20px' }}>
                  <h4 className="personalization-section__title" style={{ fontSize: '13px', marginBottom: '10px' }}>{group.label}</h4>
                  <div className="bubble-options">
                    {group.items.map((bc) => (
                      <button
                        key={bc.id}
                        className={`bubble-option ${settings.bubbleTheme === bc.id ? 'bubble-option--active' : ''}`}
                        onClick={() => onSettingsChange('bubbleTheme', bc.id)}
                        id={`bubble-${bc.id}`}
                      >
                        <div className="bubble-option__preview">
                          <span style={{ 
                            background: bc.ai, 
                            border: bc.border ? '1.5px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: bc.border ? '0 0 6px rgba(255,255,255,0.05)' : 'none'
                          }}>AI</span>
                          <span style={{ 
                            background: bc.user, 
                            color: bc.border ? '#ccc' : '#000',
                            border: bc.border ? '1.5px solid rgba(255,255,255,0.2)' : 'none'
                          }}>You</span>
                        </div>
                        <span className="bubble-option__label">{bc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <h4 className="personalization-section__title" style={{ marginTop: 24 }}>Bubble Radius</h4>
              <div className="slider-wrap">
                <input
                  type="range"
                  min="4"
                  max="24"
                  value={settings.bubbleRadius || 18}
                  onChange={(e) => onSettingsChange('bubbleRadius', Number(e.target.value))}
                  className="slider"
                  id="slider-bubble-radius"
                  style={{ '--val': `${((settings.bubbleRadius || 18) - 4) / (24 - 4) * 100}%` }}
                />
                <span className="slider-value">{settings.bubbleRadius || 18}px</span>
              </div>

              <h4 className="personalization-section__title" style={{ marginTop: 24 }}>Avatar Size</h4>
              <div className="slider-wrap">
                <input
                  type="range"
                  min="24"
                  max="64"
                  value={settings.avatarSize || 40}
                  onChange={(e) => onSettingsChange('avatarSize', Number(e.target.value))}
                  className="slider"
                  id="slider-avatar-size"
                  style={{ '--val': `${((settings.avatarSize || 40) - 24) / (64 - 24) * 100}%` }}
                />
                <span className="slider-value">{settings.avatarSize || 40}px</span>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="personalization-section">
              <h4 className="personalization-section__title">Font Family</h4>
              <div className="font-options">
                {fontOptions.map((font) => (
                  <button
                    key={font}
                    className={`font-option ${settings.font === font ? 'font-option--active' : ''}`}
                    style={{ fontFamily: font }}
                    onClick={() => onSettingsChange('font', font)}
                    id={`font-${font.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <span className="font-option__preview">Aa</span>
                    <span className="font-option__name">{font}</span>
                  </button>
                ))}
              </div>

              <h4 className="personalization-section__title" style={{ marginTop: 24 }}>Font Size</h4>
              <div className="slider-wrap">
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={settings.fontSize || 14}
                  onChange={(e) => onSettingsChange('fontSize', Number(e.target.value))}
                  className="slider"
                  id="slider-font-size"
                  style={{ '--val': `${((settings.fontSize || 14) - 12) / (20 - 12) * 100}%` }}
                />
                <span className="slider-value">{settings.fontSize || 14}px</span>
              </div>
            </div>
          )}

          {/* Accent Color Tab */}
          {activeTab === 'accent' && (
            <div className="personalization-section">
              <h4 className="personalization-section__title">Accent Color</h4>
              <div className="accent-options">
                {accentColors.map((color) => (
                  <button
                    key={color.id}
                    className={`accent-option ${settings.accent === color.value ? 'accent-option--active' : ''}`}
                    onClick={() => onSettingsChange('accent', color.value)}
                    id={`accent-${color.id}`}
                  >
                    <span
                      className="accent-option__swatch"
                      style={{ background: color.value, boxShadow: `0 0 12px ${color.value}60` }}
                    />
                    <span className="accent-option__label">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset */}
        <div className="personalization-panel__footer">
          <button
            className="personalization-panel__reset"
            id="btn-reset-personalization"
            onClick={() => onSettingsChange('reset', null)}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
}
