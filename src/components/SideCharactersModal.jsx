import { useState, useEffect } from 'react';
import './SideCharactersModal.css';

export default function SideCharactersModal({ isOpen, onClose, characterId }) {
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (isOpen && characterId) {
      setLoading(true);
      fetch(`/api/characters/${characterId}/npcs`)
        .then(res => res.json())
        .then(data => {
          setNpcs(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error("Error fetching NPCs:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, characterId]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddNpc = () => {
    setNpcs((prev) => [
      ...prev,
      { id: Date.now().toString(), text: '' },
    ]);
  };

  const handleNpcChange = (id) => (event) => {
    const { value } = event.target;
    setNpcs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  const handleDeleteNpc = (id) => {
    setNpcs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteAll = () => {
    setNpcs([]);
  };

  const handleSave = async () => {
    if (!characterId) return;
    try {
      const res = await fetch(`/api/characters/${characterId}/npcs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npcs: npcs.filter(n => n.text.trim()) })
      });
      if (res.ok) {
        showToast('Karakter sampingan berhasil disimpan.', 'success');
        setTimeout(() => onClose(), 1000);
      } else {
        showToast('Gagal menyimpan karakter sampingan.', 'error');
      }
    } catch (err) {
      console.error("Error saving NPCs:", err);
      showToast('Gagal menyimpan karakter sampingan.', 'error');
    }
  };

  return (
    <>
      <div
        className={`side-characters-modal__overlay ${isOpen ? 'side-characters-modal__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <section
        className={`side-characters-modal ${isOpen ? 'side-characters-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-characters-modal-title"
      >
        <div className="side-characters-modal__panel" onClick={(event) => event.stopPropagation()}>
          
          {/* Toast Notification */}
          {toastMessage && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: toastMessage.type === 'error' ? '#e11d48' : '#10b981',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 999,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              animation: 'fadeInDown 0.3s ease-out'
            }}>
              {toastMessage.message}
            </div>
          )}

          <div className="side-characters-modal__header">
            <div>
              <span className="side-characters-modal__eyebrow">Karakter Sampingan</span>
              <h2 className="side-characters-modal__title" id="side-characters-modal-title">Daftar NPC Roleplay</h2>
              <p className="side-characters-modal__subtitle">
                Satu kolom untuk satu NPC. Isi deskripsi, latar belakang, dan sifatnya.
              </p>
            </div>
            <button className="side-characters-modal__close" onClick={onClose} type="button" aria-label="Tutup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="side-characters-modal__content">
            <div className="side-characters-modal__toolbar">
              <div className="side-characters-modal__stat">Total NPC: {npcs.length}</div>
              <div className="side-characters-modal__toolbar-actions">
                <button className="side-characters-modal__btn side-characters-modal__btn--ghost" type="button" onClick={handleAddNpc}>
                  Tambah NPC
                </button>
                <button
                  className="side-characters-modal__btn side-characters-modal__btn--danger"
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={!npcs.length}
                >
                  Delete All
                </button>
              </div>
            </div>

            <div className="side-characters-modal__list">
              {loading ? (
                <div className="side-characters-modal__empty">Memuat NPC...</div>
              ) : npcs.length === 0 ? (
                <div className="side-characters-modal__empty">
                  Belum ada NPC. Tambah dulu biar AI tahu siapa aja yang terlibat.
                </div>
              ) : (
                npcs.map((item, index) => (
                  <div className="side-character-item" key={item.id}>
                    <div className="side-character-item__header">
                      <span className="side-character-item__label">NPC {index + 1}</span>
                      <button
                        className="side-character-item__delete"
                        type="button"
                        onClick={() => handleDeleteNpc(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                    <textarea
                      className="side-character-item__textarea"
                      rows={4}
                      placeholder="Nama: ...\nPeran: ...\nLatar belakang: ...\nSifat: ..."
                      value={item.text}
                      onChange={handleNpcChange(item.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="side-characters-modal__footer">
            <span className="side-characters-modal__footer-note">NPC disimpan per karakter AI.</span>
            <div className="side-characters-modal__actions">
              <button className="side-characters-modal__btn side-characters-modal__btn--ghost" type="button" onClick={onClose}>
                Batal
              </button>
              <button className="side-characters-modal__btn side-characters-modal__btn--primary" type="button" onClick={handleSave}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
