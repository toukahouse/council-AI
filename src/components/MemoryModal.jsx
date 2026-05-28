import { useState, useEffect } from 'react';
import './MemoryModal.css';

export default function MemoryModal({ isOpen, onClose, characterId }) {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && characterId) {
      fetchMemories();
    }
  }, [isOpen, characterId]);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/characters/${characterId}/memories`);
      if (response.ok) {
        const data = await response.json();
        // data looks like [{ id, text, characterId }, ...]
        setMemories(data.map(m => ({ id: m.id, text: m.text })));
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!characterId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/characters/${characterId}/memories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memories: memories.map(m => ({ text: m.text })) })
      });
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 1500);
      } else {
        console.error("Failed to save memories");
        alert("Gagal menyimpan memori. Coba lagi nanti.");
      }
    } catch (error) {
      console.error("Error saving memories:", error);
      alert("Error saat menyimpan memori.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMemory = () => {
    setMemories((prev) => [
      ...prev,
      { id: Date.now(), text: '' },
    ]);
  };

  const handleMemoryChange = (id) => (event) => {
    const { value } = event.target;
    setMemories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  const handleDeleteMemory = (id) => {
    setMemories((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteAll = () => {
    setMemories([]);
  };

  return (
    <>
      <div
        className={`memory-modal__overlay ${isOpen ? 'memory-modal__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <section
        className={`memory-modal ${isOpen ? 'memory-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="memory-modal-title"
      >
        <div className="memory-modal__panel" onClick={(event) => event.stopPropagation()}>
          <div className="memory-modal__header">
            <div>
              <span className="memory-modal__eyebrow">Edit Memory</span>
              <h2 className="memory-modal__title" id="memory-modal-title">Ingatan Karakter AI</h2>
              <p className="memory-modal__subtitle">
                Simpan fakta penting yang harus diingat AI selama roleplay.
              </p>
            </div>
            <button className="memory-modal__close" onClick={onClose} type="button" aria-label="Tutup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="memory-modal__content">
            <div className="memory-modal__toolbar">
              <div className="memory-modal__stat">Total memory: {memories.length}</div>
              <div className="memory-modal__toolbar-actions">
                <button className="memory-modal__btn memory-modal__btn--ghost" type="button" onClick={handleAddMemory}>
                  Tambah Memory
                </button>
                <button
                  className="memory-modal__btn memory-modal__btn--danger"
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={!memories.length}
                >
                  Delete All
                </button>
              </div>
            </div>

            <div className="memory-modal__list">
              {memories.length === 0 ? (
                <div className="memory-modal__empty">
                  Belum ada memory. Tambah dulu biar AI punya konteks roleplay.
                </div>
              ) : (
                memories.map((item, index) => (
                  <div className="memory-item" key={item.id}>
                    <div className="memory-item__header">
                      <span className="memory-item__label">Memory {index + 1}</span>
                      <button
                        className="memory-item__delete"
                        type="button"
                        onClick={() => handleDeleteMemory(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                    <textarea
                      className="memory-item__textarea"
                      rows={3}
                      placeholder="Contoh: AI mengingat nama karakter dan hubungan dengan user."
                      value={item.text}
                      onChange={handleMemoryChange(item.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="memory-modal__footer">
            <span className="memory-modal__footer-note">Memory disimpan per karakter AI.</span>
            <div className="memory-modal__actions">
              <button className="memory-modal__btn memory-modal__btn--ghost" type="button" onClick={onClose} disabled={isSaving}>
                Batal
              </button>
              <button className="memory-modal__btn memory-modal__btn--primary" type="button" onClick={handleSave} disabled={isSaving || showSuccess}>
                {isSaving ? 'Menyimpan...' : showSuccess ? 'Tersimpan!' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Loading / Success Overlay */}
      {(isSaving || showSuccess || isLoading) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '20px 40px', borderRadius: '12px', color: showSuccess ? '#10b981' : 'var(--text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {showSuccess ? (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Memori Berhasil Disimpan!
              </>
            ) : (
              isLoading ? 'Memuat Memory...' : 'Menyimpan Memory. Mohon tunggu...'
            )}
          </div>
        </div>
      )}
    </>
  );
}
