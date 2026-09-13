import { useState, useMemo, useRef, useEffect } from 'react';
import { calculateContextBreakdown, formatTokens } from '../utils/tokenCounter';
import './TokenCounter.css';

export default function TokenCounter({
  characterData,
  activePersona,
  memories = [],
  npcs = [],
  history = [],
  historyLimit = 30,
  roleplayTime = '',
  roleplayDate = '',
  draftMessage = '',
  lastOutputTokens = 0,
  totalOutputTokens = 0,
  contextWindowLimit = 32768,
  isVisible = true,
  onToggleVisibility
}) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);

  // Close popover when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPopover) {
        setShowPopover(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPopover]);

  // Real-time calculation of input tokens and breakdown
  const breakdown = useMemo(() => {
    return calculateContextBreakdown({
      character: characterData,
      persona: activePersona,
      memories,
      npcs,
      history,
      historyLimit,
      roleplayTime,
      roleplayDate,
      draftMessage
    });
  }, [
    characterData,
    activePersona,
    memories,
    npcs,
    history,
    historyLimit,
    roleplayTime,
    roleplayDate,
    draftMessage
  ]);

  const totalInput = breakdown.totalInputTokens;
  const contextPercentage = Math.min(
    100,
    Math.round(((totalInput + lastOutputTokens) / contextWindowLimit) * 100)
  );

  // If user minimized/hid the counter, show a tiny unobtrusive restore button
  if (!isVisible) {
    return (
      <div className="token-counter">
        <button
          type="button"
          className="token-counter__minimized-btn"
          onClick={onToggleVisibility}
          title="Tampilkan Token Counter"
          aria-label="Tampilkan Token Counter"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Tok</span>
        </button>
      </div>
    );
  }

  return (
    <div className="token-counter" ref={popoverRef}>
      {/* Subtle Main Badge Pill */}
      <button
        type="button"
        className={`token-counter__badge ${showPopover ? 'token-counter__badge--active' : ''}`}
        onClick={() => setShowPopover(!showPopover)}
        title="Klik untuk melihat rincian konteks & token"
        aria-label="Rincian Token"
      >
        <span className="token-counter__icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </span>

        {/* Input Tokens */}
        <span className="token-counter__stat">
          <span className="token-counter__stat-label">In:</span>
          <span className="token-counter__stat-val">~{formatTokens(totalInput)}</span>
        </span>

        <span className="token-counter__divider"></span>

        {/* Output Tokens */}
        <span className="token-counter__stat">
          <span className="token-counter__stat-label">Out:</span>
          <span className="token-counter__stat-val">{formatTokens(lastOutputTokens)}</span>
        </span>
      </button>

      {/* Popover Backdrop for clicking outside */}
      {showPopover && (
        <div
          className="token-counter__backdrop"
          onClick={() => setShowPopover(false)}
        />
      )}

      {/* Glassmorphic Breakdown Popover */}
      {showPopover && (
        <div className="token-counter__popover">
          <div className="token-counter__header">
            <div className="token-counter__title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Rincian Konteks & Token</span>
            </div>
            <button
              type="button"
              className="token-counter__close-btn"
              onClick={() => setShowPopover(false)}
              aria-label="Tutup"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Input Section */}
          <div className="token-counter__section">
            <div className="token-counter__section-title">
              <span>📥 Input (Akan Dikirim)</span>
              <span className="token-counter__section-badge">~{totalInput.toLocaleString('id-ID')} tok</span>
            </div>

            <div className="token-counter__row">
              <span className="token-counter__row-label">
                <span className="token-counter__row-icon">🎭</span> Karakter & Sistem
              </span>
              <span className="token-counter__row-val">{breakdown.characterTokens.toLocaleString('id-ID')}</span>
            </div>

            {(breakdown.timeTokens > 0) && (
              <div className="token-counter__row">
                <span className="token-counter__row-label">
                  <span className="token-counter__row-icon">⏰</span> Waktu & Tanggal
                </span>
                <span className="token-counter__row-val">{breakdown.timeTokens.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="token-counter__row">
              <span className="token-counter__row-label">
                <span className="token-counter__row-icon">👤</span> Persona User
              </span>
              <span className="token-counter__row-val">{breakdown.personaTokens.toLocaleString('id-ID')}</span>
            </div>

            {(breakdown.memoryTokens > 0 || breakdown.npcTokens > 0) && (
              <div className="token-counter__row">
                <span className="token-counter__row-label">
                  <span className="token-counter__row-icon">🧠</span> Memory & NPC
                </span>
                <span className="token-counter__row-val">{(breakdown.memoryTokens + breakdown.npcTokens).toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="token-counter__row">
              <span className="token-counter__row-label">
                <span className="token-counter__row-icon">💬</span> Riwayat ({breakdown.historyCount} pesan)
              </span>
              <span className="token-counter__row-val">{breakdown.historyTokens.toLocaleString('id-ID')}</span>
            </div>

            <div className="token-counter__row" style={{ color: breakdown.draftTokens > 0 ? '#a855f7' : undefined }}>
              <span className="token-counter__row-label">
                <span className="token-counter__row-icon">✍️</span> Draf Saat Ini
              </span>
              <span className="token-counter__row-val">{breakdown.draftTokens.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Output Section */}
          <div className="token-counter__section">
            <div className="token-counter__section-title">
              <span>📤 Output (Respon AI)</span>
              <span className="token-counter__section-badge" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.12)' }}>
                {lastOutputTokens.toLocaleString('id-ID')} tok
              </span>
            </div>

            <div className="token-counter__row">
              <span className="token-counter__row-label">Respon Terakhir</span>
              <span className="token-counter__row-val">{lastOutputTokens.toLocaleString('id-ID')} tok</span>
            </div>

            <div className="token-counter__row">
              <span className="token-counter__row-label">Akumulasi Sesi Chat</span>
              <span className="token-counter__row-val">{totalOutputTokens.toLocaleString('id-ID')} tok</span>
            </div>
          </div>

          {/* Context Window Capacity Bar */}
          <div className="token-counter__bar-wrap">
            <div className="token-counter__bar-header">
              <span>Kapasitas Context Model</span>
              <span>{contextPercentage}% ({formatTokens(totalInput + lastOutputTokens)} / {formatTokens(contextWindowLimit)})</span>
            </div>
            <div className="token-counter__bar-track">
              <div
                className={`token-counter__bar-fill ${contextPercentage > 85 ? 'token-counter__bar-fill--warning' : ''}`}
                style={{ width: `${Math.max(3, contextPercentage)}%` }}
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="token-counter__footer">
            <span>Estimasi real-time BPE</span>
            {onToggleVisibility && (
              <button
                type="button"
                className="token-counter__hide-btn"
                onClick={() => {
                  setShowPopover(false);
                  onToggleVisibility();
                }}
                title="Sembunyikan badge token"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <span>Sembunyikan</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
