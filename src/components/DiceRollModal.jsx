import React, { useState, useEffect } from 'react';
import './DiceRollModal.css';

export default function DiceRollModal({ isOpen, onClose, onRollComplete, initialDialogue = '' }) {
  const [actionDescription, setActionDescription] = useState('');
  const [dialogue, setDialogue] = useState(initialDialogue || '');
  const [difficultyClass, setDifficultyClass] = useState(12);
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setDialogue(initialDialogue || '');
    }
  }, [isOpen, initialDialogue]);

  if (!isOpen) return null;

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRollResult(null);

    let count = 0;
    const interval = setInterval(() => {
      setRollResult(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count >= 14) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 20) + 1;
        setRollResult(finalValue);
        setIsRolling(false);
      }
    }, 50);
  };

  const handleApply = () => {
    if (rollResult === null) return;
    const isSuccess = rollResult >= difficultyClass;
    onRollComplete({
      action: actionDescription.trim() || 'Tindakan pemeriksaan keahlian',
      dialogue: dialogue.trim(),
      total: rollResult,
      isSuccess,
      dc: difficultyClass,
    });
    onClose();
  };

  const quickActionIdeas = [
    'Menyelinap tanpa suara',
    'Membujuk dengan kata-kata manis',
    'Memeriksa petunjuk tersembunyi',
    'Menangkis serangan mendadak',
    'Membuka kunci kuno',
    'Mendekat dan menggoda secara fisik',
  ];

  const isSuccess = rollResult !== null ? rollResult >= difficultyClass : null;

  return (
    <div className="dice-modal__overlay" onClick={onClose}>
      <div
        className="dice-modal__container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="dice-modal__header">
          <div className="dice-modal__title-wrap">
            <div className="dice-modal__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h.01" />
                <path d="M17 7h.01" />
                <path d="M7 17h.01" />
                <path d="M17 17h.01" />
                <path d="M12 12h.01" />
              </svg>
            </div>
            <div>
              <h3 className="dice-modal__title">Lempar Dadu D20 Interaktif</h3>
              <p className="dice-modal__subtitle">Tentukan nasib dan risiko tindakanmu dalam cerita</p>
            </div>
          </div>
          <button className="dice-modal__close-btn" onClick={onClose} aria-label="Tutup modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="dice-modal__body">
          {/* Action Input */}
          <div className="dice-modal__field">
            <label className="dice-modal__label">Apa aksi yang ingin kamu coba lakukan?</label>
            <input
              type="text"
              className="dice-modal__input"
              value={actionDescription}
              onChange={(e) => setActionDescription(e.target.value)}
              placeholder="Contoh: Meneliti simbol kuno, memikat karakter, atau menyerang..."
            />
          </div>

          {/* Dialogue / Speech Input */}
          <div className="dice-modal__field">
            <label className="dice-modal__label">
              Dialog / Ucapan Kamu <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '11px' }}>(Opsional)</span>
            </label>
            <textarea
              className="dice-modal__textarea"
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
              placeholder='Contoh: "Jangan cemberut begitu sayang..." atau "Menyerahlah sekarang!"'
              rows="2"
            />
          </div>

          {/* Quick Idea Chips */}
          <div className="dice-modal__chips-wrap">
            <span className="dice-modal__chips-label">Ide cepat:</span>
            <div className="dice-modal__chips">
              {quickActionIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="dice-modal__chip"
                  onClick={() => setActionDescription(idea)}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Class (DC) Selector */}
          <div className="dice-modal__field">
            <label className="dice-modal__label">
              Tingkat Kesulitan (Target DC): <strong className="dice-modal__dc-val">{difficultyClass}</strong>
            </label>
            <div className="dice-modal__dc-presets">
              {[
                { label: 'Mudah', val: 10 },
                { label: 'Sedang', val: 12 },
                { label: 'Sulit', val: 15 },
                { label: 'Ekstrem', val: 18 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  className={`dice-modal__dc-btn ${difficultyClass === preset.val ? 'dice-modal__dc-btn--active' : ''}`}
                  onClick={() => setDifficultyClass(preset.val)}
                >
                  {preset.label} ({preset.val})
                </button>
              ))}
            </div>
          </div>

          {/* Roll Arena */}
          <div className="dice-modal__arena">
            <div className={`dice-modal__die ${isRolling ? 'dice-modal__die--rolling' : ''} ${rollResult !== null ? (isSuccess ? 'dice-modal__die--success' : 'dice-modal__die--fail') : ''}`}>
              <span className="dice-modal__die-number">
                {rollResult !== null ? rollResult : 'D20'}
              </span>
            </div>

            {rollResult !== null && !isRolling && (
              <div className={`dice-modal__outcome ${isSuccess ? 'dice-modal__outcome--success' : 'dice-modal__outcome--fail'}`}>
                {isSuccess ? (
                  <span>
                    ✓ <strong>BERHASIL!</strong> (Total: {rollResult} vs DC {difficultyClass})
                  </span>
                ) : (
                  <span>
                    ✗ <strong>GAGAL!</strong> (Total: {rollResult} vs DC {difficultyClass})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="dice-modal__footer">
          <button
            type="button"
            className="dice-modal__btn dice-modal__btn--roll"
            disabled={isRolling}
            onClick={handleRoll}
          >
            {isRolling ? 'Mengocok Dadu...' : rollResult !== null ? 'Lempar Ulang Dadu' : 'Lempar Dadu D20!'}
          </button>

          <button
            type="button"
            className="dice-modal__btn dice-modal__btn--apply"
            disabled={rollResult === null || isRolling}
            onClick={handleApply}
          >
            Kirim Hasil ke Roleplay
          </button>
        </div>
      </div>
    </div>
  );
}
