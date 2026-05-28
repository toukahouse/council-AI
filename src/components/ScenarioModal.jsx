import { useState, useEffect } from 'react';
import './ScenarioModal.css';

export default function ScenarioModal({ isOpen, onClose, characterId, conversationId, roleplayDate, roleplayTime }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Manual summarize states
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (isOpen && conversationId) {
      setLoading(true);
      fetch(`http://localhost:3001/api/conversations/${conversationId}/scenarios`)
        .then(res => res.json())
        .then(data => {
          setScenarios(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error("Error fetching scenarios:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, conversationId]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddScenario = () => {
    setScenarios((prev) => [
      ...prev,
      { id: Date.now().toString(), text: '' },
    ]);
  };

  const handleScenarioChange = (id) => (event) => {
    const { value } = event.target;
    setScenarios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  const handleDeleteScenario = (id) => {
    setScenarios((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteAll = () => {
    setScenarios([]);
  };

  const handleSave = async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`http://localhost:3001/api/conversations/${conversationId}/scenarios`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios: scenarios.filter(s => s.text.trim()) })
      });
      if (res.ok) {
        showToast('Skenario berhasil disimpan.', 'success');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      console.error("Error saving scenarios:", err);
      showToast('Gagal menyimpan skenario.', 'error');
    }
  };

  const handleManualSummarize = async () => {
    if (!startId || !endId) {
      showToast('Mohon isi ID Awal dan ID Akhir', 'error');
      return;
    }
    
    if (!conversationId) {
      showToast('Percakapan belum dimulai', 'error');
      return;
    }

    const sId = parseInt(startId, 10);
    const eId = parseInt(endId, 10);

    if (isNaN(sId) || isNaN(eId) || sId > eId || sId < 1) {
      showToast('Rentang ID tidak valid', 'error');
      return;
    }

    setIsSummarizing(true);
    try {
      const savedSettings = localStorage.getItem('apiSettings');
      const apiSettings = savedSettings ? JSON.parse(savedSettings) : {};

      const res = await fetch(`http://localhost:3001/api/chat/${conversationId}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startIndex: sId - 1, 
          endIndex: eId - 1, 
          apiSettings,
          dateContext: roleplayDate,
          timeContext: roleplayTime
        })
      });

      if (res.ok) {
        const result = await res.json();
        // Add new summary to local state
        setScenarios(prev => [
          ...prev, 
          { id: Date.now().toString(), text: result.summary }
        ]);
        showToast('Ringkasan manual berhasil dibuat!', 'success');
        setStartId('');
        setEndId('');
      } else {
        showToast('Gagal membuat ringkasan manual.', 'error');
      }
    } catch (err) {
      console.error("Manual summarize error:", err);
      showToast('Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <>
      <div
        className={`scenario-modal__overlay ${isOpen ? 'scenario-modal__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <section
        className={`scenario-modal ${isOpen ? 'scenario-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scenario-modal-title"
      >
        <div className="scenario-modal__panel" onClick={(event) => event.stopPropagation()}>
          
          {/* Toast Notification inside modal */}
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

          <div className="scenario-modal__header">
            <div>
              <span className="scenario-modal__eyebrow">Skenario Saat Ini</span>
              <h2 className="scenario-modal__title" id="scenario-modal-title">Alur Cerita Aktif</h2>
              <p className="scenario-modal__subtitle">
                Catat kejadian penting dan alur cerita yang sedang berlangsung.
              </p>
            </div>
            <button className="scenario-modal__close" onClick={onClose} type="button" aria-label="Tutup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="scenario-modal__content">
            {/* Manual Summarize Section */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: '#10b981' }}>Ringkas Manual Cerita</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ID Pesan Awal</label>
                  <input 
                    type="number" 
                    value={startId} 
                    onChange={e => setStartId(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px' }}
                    placeholder="Contoh: 1"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ID Pesan Akhir</label>
                  <input 
                    type="number" 
                    value={endId} 
                    onChange={e => setEndId(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px' }}
                    placeholder="Contoh: 10"
                  />
                </div>
                <button 
                  onClick={handleManualSummarize}
                  disabled={isSummarizing}
                  style={{
                    background: isSummarizing ? '#4b5563' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: isSummarizing ? 'not-allowed' : 'pointer',
                    height: '37px'
                  }}
                >
                  {isSummarizing ? 'Meringkas...' : 'Ringkas'}
                </button>
              </div>
            </div>

            <div className="scenario-modal__toolbar">
              <div className="scenario-modal__stat">Total skenario: {scenarios.length}</div>
              <div className="scenario-modal__toolbar-actions">
                <button className="scenario-modal__btn scenario-modal__btn--ghost" type="button" onClick={handleAddScenario}>
                  Tambah Skenario
                </button>
                <button
                  className="scenario-modal__btn scenario-modal__btn--danger"
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={!scenarios.length}
                >
                  Delete All
                </button>
              </div>
            </div>

            <div className="scenario-modal__list">
              {loading ? (
                <div className="scenario-modal__empty">Memuat skenario...</div>
              ) : scenarios.length === 0 ? (
                <div className="scenario-modal__empty">
                  Belum ada skenario. Tambah dulu biar AI paham alur cerita.
                </div>
              ) : (
                scenarios.map((item, index) => (
                  <div className="scenario-item" key={item.id}>
                    <div className="scenario-item__header">
                      <span className="scenario-item__label">Skenario {index + 1}</span>
                      <button
                        className="scenario-item__delete"
                        type="button"
                        onClick={() => handleDeleteScenario(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                    <textarea
                      className="scenario-item__textarea"
                      rows={3}
                      placeholder="Contoh: Tim menemukan pesan rahasia di ruang komando."
                      value={item.text}
                      onChange={handleScenarioChange(item.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="scenario-modal__footer">
            <span className="scenario-modal__footer-note">Skenario disimpan per karakter AI.</span>
            <div className="scenario-modal__actions">
              <button className="scenario-modal__btn scenario-modal__btn--ghost" type="button" onClick={onClose}>
                Batal
              </button>
              <button className="scenario-modal__btn scenario-modal__btn--primary" type="button" onClick={handleSave}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
