import { useMemo, useState, useEffect } from 'react';
import './PersonaModal.css';

export default function PersonaModal({ isOpen, onClose, onSave }) {
  const [personas, setPersonas] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [useDefault, setUseDefault] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:3001/api/personas')
        .then(res => res.json())
        .then(data => {
          setPersonas(data);
          const defaultId = localStorage.getItem('defaultPersonaId');
          if (defaultId && data.find(p => p.id === defaultId)) {
            setSelectedId(defaultId);
            setUseDefault(true);
          } else if (data.length > 0 && !selectedId) {
            setSelectedId(data[0].id);
          }
        })
        .catch(err => console.error("Error fetching personas:", err));
    }
  }, [isOpen]);

  const activePersona = useMemo(
    () => personas.find((persona) => persona.id === selectedId),
    [selectedId, personas]
  );

  return (
    <>
      <div
        className={`persona-modal__overlay ${isOpen ? 'persona-modal__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <section
        className={`persona-modal ${isOpen ? 'persona-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="persona-modal-title"
      >
        <div className="persona-modal__panel" onClick={(event) => event.stopPropagation()}>
          <div className="persona-modal__header">
            <div>
              <span className="persona-modal__eyebrow">Persona Pengguna</span>
              <h2 className="persona-modal__title" id="persona-modal-title">Pilih Avatar Persona</h2>
              <p className="persona-modal__subtitle">
                Persona di sini adalah avatar user untuk roleplay. Pilih karakter yang mewakili kamu di dunia cerita.
              </p>
            </div>
            <button className="persona-modal__close" onClick={onClose} type="button" aria-label="Tutup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="persona-modal__content">
            <div className="persona-modal__summary">
              <div className="persona-modal__active">
                <span className="persona-modal__badge">Avatar aktif</span>
                <div className="persona-modal__active-info">
                  <span className="persona-modal__active-name">{activePersona?.name}</span>
                  <span className="persona-modal__active-role">{activePersona?.role}</span>
                </div>
              </div>
              <div className="persona-modal__default">
                <div className="persona-modal__default-info">
                  <span className="persona-modal__label">Jadikan persona ini default</span>
                  <span className="persona-modal__hint">Hanya satu persona default. Dipakai otomatis di percakapan baru.</span>
                </div>
                <button
                  className={`persona-modal__toggle ${useDefault ? 'persona-modal__toggle--on' : ''}`}
                  onClick={() => setUseDefault((prev) => !prev)}
                  type="button"
                  aria-pressed={useDefault}
                >
                  <span className="persona-modal__toggle-dot" />
                </button>
              </div>
            </div>

            <div className="persona-modal__grid">
              {personas.length === 0 ? (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada persona dibuat.</p>
              ) : personas.map((persona) => (
                <button
                  key={persona.id}
                  className={`persona-card ${selectedId === persona.id ? 'persona-card--active' : ''}`}
                  onClick={() => setSelectedId(persona.id)}
                  type="button"
                >
                  <div className="persona-card__avatar" style={{ overflow: 'hidden', padding: 0 }}>
                    <img src={persona.avatar || '/user_avatar.png'} alt={persona.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="persona-card__content">
                    <div className="persona-card__header">
                      <div>
                        <span className="persona-card__name">{persona.name}</span>
                        <span className="persona-card__role">{persona.role}</span>
                      </div>
                      <span className="persona-card__radio" aria-hidden="true" />
                    </div>
                    <p className="persona-card__desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {persona.description || persona.role}
                    </p>
                    <div className="persona-card__tags">
                      <span className="persona-card__tag">Custom</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="persona-modal__footer">
            <span className="persona-modal__footer-note">Perubahan bisa diterapkan setelah disimpan.</span>
            <div className="persona-modal__actions">
              <button className="persona-modal__btn persona-modal__btn--ghost" type="button" onClick={onClose}>
                Batal
              </button>
              <button 
                className="persona-modal__btn persona-modal__btn--primary" 
                type="button" 
                onClick={() => {
                  if (onSave && activePersona) {
                    onSave(activePersona);
                    if (useDefault) {
                      localStorage.setItem('defaultPersonaId', activePersona.id);
                    } else {
                      localStorage.removeItem('defaultPersonaId');
                    }
                  }
                  onClose();
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
