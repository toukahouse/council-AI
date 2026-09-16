import React, { useState } from 'react';
import './PersonalityMatrix.css';

const PRESET_BADGES = [
  // Anime & VN Archetypes
  'Tsundere',
  'Yandere',
  'Kuudere',
  'Dandere',
  'Himedere',
  'Deredere',
  // Relationship Dynamics
  'Manja',
  'Penggoda',
  'Sarkastik',
  'Protektif',
  'Misterius',
  'Gengsian',
  // Wild & 18+ Dynamics
  'Sadistik',
  'Masokis',
  'Uninhibited (Tanpa Rem)',
  'Femme Fatale',
];

const SLIDER_CONFIGS = [
  {
    key: 'dominance',
    label: 'Kendali & Otoritas',
    lowLabel: 'Submisif (Pasrah)',
    midLabel: 'Setara & Fleksibel',
    highLabel: 'Dominan (Alpha/Predator)',
    color: '#8b5cf6',
  },
  {
    key: 'warmth',
    label: 'Kehangatan & Ekspresi',
    lowLabel: 'Dingin/Apatis (Kuudere)',
    midLabel: 'Tenang & Rasional',
    highLabel: 'Hangat & Ceria',
    color: '#06b6d4',
  },
  {
    key: 'patience',
    label: 'Temperamen & Kesabaran',
    lowLabel: 'Penyabar / Stoic',
    midLabel: 'Stabil & Wajar',
    highLabel: 'Pemarah / Sumbu Pendek',
    color: '#f59e0b',
  },
  {
    key: 'libido',
    label: 'Hasrat Sensual & Keberanian Fisik (18+)',
    lowLabel: 'Polos & Jaga Jarak',
    midLabel: 'Romantis Normal',
    highLabel: 'Liar & Ecchi / Sensual',
    color: '#ec4899',
  },
  {
    key: 'morality',
    label: 'Moralitas & Taktik',
    lowLabel: 'Lurus & Berhati Mulia',
    midLabel: 'Pragmatis & Realistis',
    highLabel: 'Manipulatif / Sadis / Licik',
    color: '#e11d48',
  },
];

export default function PersonalityMatrix({ traits, onChange }) {
  const [newCustomTrait, setNewCustomTrait] = useState('');

  const currentSliders = traits?.sliders || {
    dominance: 50,
    warmth: 50,
    patience: 50,
    libido: 50,
    morality: 50,
  };

  const currentBadges = traits?.badges || [];
  const currentCustomTraits = traits?.customTraits || [];

  const handleSliderChange = (key, val) => {
    const num = parseInt(val, 10);
    onChange({
      ...traits,
      sliders: {
        ...currentSliders,
        [key]: num,
      },
      badges: currentBadges,
      customTraits: currentCustomTraits,
    });
  };

  const toggleBadge = (badge) => {
    let nextBadges;
    if (currentBadges.includes(badge)) {
      nextBadges = currentBadges.filter((b) => b !== badge);
    } else {
      nextBadges = [...currentBadges, badge];
    }
    onChange({
      ...traits,
      sliders: currentSliders,
      badges: nextBadges,
      customTraits: currentCustomTraits,
    });
  };

  const handleAddCustomTrait = (e) => {
    e.preventDefault();
    const trimmed = newCustomTrait.trim();
    if (!trimmed || currentCustomTraits.includes(trimmed)) return;
    onChange({
      ...traits,
      sliders: currentSliders,
      badges: currentBadges,
      customTraits: [...currentCustomTraits, trimmed],
    });
    setNewCustomTrait('');
  };

  const handleRemoveCustomTrait = (traitToRemove) => {
    onChange({
      ...traits,
      sliders: currentSliders,
      badges: currentBadges,
      customTraits: currentCustomTraits.filter((t) => t !== traitToRemove),
    });
  };

  const getSliderStatus = (cfg, val) => {
    if (val >= 65) return cfg.highLabel;
    if (val <= 35) return cfg.lowLabel;
    return cfg.midLabel;
  };

  return (
    <div className="personality-matrix">
      <div className="personality-matrix__header">
        <h3 className="personality-matrix__title">DNA & Parameter Kepribadian (Personality Matrix)</h3>
        <p className="personality-matrix__desc">
          Atur intensitas psikologi dan sifat khas karakter secara presisi untuk interaksi yang hidup, tidak nurut, dan tidak tertebak.
        </p>
      </div>

      {/* 5 Core Dimension Sliders */}
      <div className="personality-matrix__sliders">
        {SLIDER_CONFIGS.map((cfg) => {
          const val = currentSliders[cfg.key] ?? 50;
          const statusText = getSliderStatus(cfg, val);
          return (
            <div key={cfg.key} className="personality-slider">
              <div className="personality-slider__label-row">
                <span className="personality-slider__name">{cfg.label}</span>
                <span className="personality-slider__status" style={{ color: cfg.color }}>
                  {statusText} <strong>({val}%)</strong>
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={val}
                onChange={(e) => handleSliderChange(cfg.key, e.target.value)}
                className="personality-slider__range"
                style={{
                  accentColor: cfg.color,
                }}
              />

              <div className="personality-slider__scale">
                <span>{cfg.lowLabel}</span>
                <span>{cfg.highLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset Archetype Badges */}
      <div className="personality-matrix__badges-section">
        <label className="personality-matrix__label">
          Arketip & Sifat Khas (Klik untuk pilih):
        </label>
        <div className="personality-matrix__badge-list">
          {PRESET_BADGES.map((badge) => {
            const isSelected = currentBadges.includes(badge);
            return (
              <button
                key={badge}
                type="button"
                className={`personality-badge ${isSelected ? 'personality-badge--active' : ''}`}
                onClick={() => toggleBadge(badge)}
              >
                {isSelected && <span className="personality-badge__check">✓</span>}
                {badge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Trait Input */}
      <div className="personality-matrix__custom-section">
        <label className="personality-matrix__label">Ciri Khusus Tambahan:</label>
        
        {currentCustomTraits.length > 0 && (
          <div className="personality-matrix__custom-tags">
            {currentCustomTraits.map((trait) => (
              <span key={trait} className="personality-custom-tag">
                {trait}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomTrait(trait)}
                  className="personality-custom-tag__remove"
                  aria-label="Hapus tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="personality-matrix__custom-input-row">
          <input
            type="text"
            className="personality-matrix__custom-input"
            value={newCustomTrait}
            onChange={(e) => setNewCustomTrait(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomTrait(e);
              }
            }}
            placeholder="Tambah ciri unik bebas (misal: Suka Menggoda, Takut Gelap, Sadis Halus)..."
          />
          <button
            type="button"
            className="personality-matrix__custom-btn"
            onClick={handleAddCustomTrait}
          >
            + Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
