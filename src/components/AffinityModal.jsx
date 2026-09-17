import { useState, useEffect } from 'react';
import './AffinityModal.css';

const MOOD_OPTIONS = [
  { id: 'neutral', emoji: '😐', label: 'Netral' },
  { id: 'happy', emoji: '😊', label: 'Senang' },
  { id: 'loving', emoji: '💕', label: 'Sayang' },
  { id: 'passionate', emoji: '🔥', label: 'Bergairah' },
  { id: 'flustered', emoji: '😳', label: 'Tersipu' },
  { id: 'clingy', emoji: '🥺', label: 'Manja' },
  { id: 'smirk', emoji: '😏', label: 'Menyeringai' },
  { id: 'playful', emoji: '😜', label: 'Menggoda' },
  { id: 'dominant', emoji: '👑', label: 'Dominan' },
  { id: 'tsundere', emoji: '😣', label: 'Gengsi' },
  { id: 'jealous', emoji: '😤', label: 'Cemburu' },
  { id: 'angry', emoji: '😠', label: 'Kesal' },
  { id: 'thoughtful', emoji: '🤔', label: 'Berpikir' },
  { id: 'serious', emoji: '🧐', label: 'Serius' },
  { id: 'surprised', emoji: '😲', label: 'Terkejut' },
  { id: 'sad', emoji: '😢', label: 'Sedih' },
];

const PRESETS = [
  { label: 'Kenalan Biasa', value: 25 },
  { label: 'Teman Dekat', value: 50 },
  { label: 'Kekasih / Pacar', value: 65 },
  { label: 'Belahan Jiwa / Tunangan', value: 85 },
  { label: 'Suami / Istri', value: 95 },
];

const getAffinityTier = (val) => {
  if (val >= 95) return { label: 'Suami-Istri / Ikatan Abadi (95-100%)', color: '#f43f5e' };
  if (val >= 80) return { label: 'Belahan Jiwa / Tunangan (80-94%)', color: '#ec4899' };
  if (val >= 60) return { label: 'Kekasih / Pacaran (60-79%)', color: '#c084fc' };
  if (val >= 40) return { label: 'Teman Dekat / Rekan Akrab (40-59%)', color: '#818cf8' };
  if (val >= 20) return { label: 'Kenalan Biasa (20-39%)', color: '#38bdf8' };
  return { label: 'Asing / Berjarak & Waspada (0-19%)', color: '#94a3b8' };
};

export default function AffinityModal({
  isOpen,
  onClose,
  currentAffinity = 20,
  currentMood = 'neutral',
  charName = 'Karakter',
  onSave
}) {
  const [affinity, setAffinity] = useState(currentAffinity);
  const [mood, setMood] = useState(currentMood);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAffinity(currentAffinity ?? 20);
      setMood(currentMood || 'neutral');
    }
  }, [isOpen, currentAffinity, currentMood]);

  if (!isOpen) return null;

  const tier = getAffinityTier(affinity);

  const handleSaveLocal = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(affinity, mood);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save affinity:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`affinity-modal__overlay ${isOpen ? 'affinity-modal__overlay--visible' : ''}`} onClick={onClose}>
      <div className="affinity-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="affinity-modal__header">
          <div className="affinity-modal__title-wrap">
            <div className="affinity-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h3 className="affinity-modal__title">Atur Afinitas & Hubungan</h3>
              <p className="affinity-modal__subtitle">Sesuaikan tingkat kedekatan & mood dengan {charName}</p>
            </div>
          </div>
          <button className="affinity-modal__close-btn" onClick={onClose} type="button" aria-label="Tutup">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="affinity-modal__body">
          {/* Showcase Card */}
          <div className="affinity-showcase">
            <div className="affinity-showcase__left">
              <span className="affinity-showcase__label">Status Hubungan</span>
              <span className="affinity-showcase__tier" style={{ color: tier.color }}>
                {tier.label}
              </span>
            </div>
            <div className="affinity-showcase__pct" style={{ color: tier.color }}>
              {affinity}%
            </div>
          </div>

          {/* Slider */}
          <div className="affinity-slider-wrap">
            <input
              type="range"
              min="0"
              max="100"
              value={affinity}
              onChange={(e) => setAffinity(parseInt(e.target.value, 10))}
              className="affinity-slider"
            />
            <div className="affinity-slider__scale">
              <span>0% (Asing)</span>
              <span>50% (Akrab)</span>
              <span>100% (Suami-Istri / Intim)</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="affinity-presets">
            {PRESETS.map((p) => {
              const isActive = affinity === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  className={`affinity-preset-btn ${isActive ? 'affinity-preset-btn--active' : ''}`}
                  onClick={() => setAffinity(p.value)}
                >
                  <span>{p.label}</span>
                  <span>{p.value}%</span>
                </button>
              );
            })}
          </div>

          {/* Mood Selection */}
          <div className="affinity-moods-wrap">
            <label className="affinity-moods-label">Suasana Hati Karakter Saat Ini</label>
            <div className="affinity-mood-grid">
              {MOOD_OPTIONS.map((m) => {
                const isActive = mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`affinity-mood-btn ${isActive ? 'affinity-mood-btn--active' : ''}`}
                    onClick={() => setMood(m.id)}
                  >
                    <span className="affinity-mood-emoji">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="affinity-modal__footer">
          <button className="affinity-modal__btn affinity-modal__btn--cancel" onClick={onClose} type="button">
            Batal
          </button>
          <button
            className="affinity-modal__btn affinity-modal__btn--save"
            onClick={handleSaveLocal}
            type="button"
            disabled={isSaving}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
