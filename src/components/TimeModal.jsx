import { useState, useEffect } from 'react';
import './TimeModal.css';

export default function TimeModal({ isOpen, onClose, initialTime, initialDate, onSave }) {
  const [time, setTime] = useState(initialTime || '12:00');
  const [date, setDate] = useState(initialDate || '');

  useEffect(() => {
    if (isOpen) {
      setTime(initialTime || '12:00');
      setDate(initialDate || '');
    }
  }, [isOpen, initialTime, initialDate]);

  const handleSave = () => {
    onSave({ time, date });
    onClose();
  };

  return (
    <>
      <div
        className={`time-modal__overlay ${isOpen ? 'time-modal__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <section
        className={`time-modal ${isOpen ? 'time-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-modal-title"
      >
        <div className="time-modal__header">
          <div>
            <span className="time-modal__eyebrow">Konteks Temporal</span>
            <h2 className="time-modal__title" id="time-modal-title">Waktu & Tanggal Roleplay</h2>
            <p className="time-modal__subtitle">
              Beritahu karakter AI tentang jam dan tanggal kejadian saat ini.
            </p>
          </div>
          <button className="time-modal__close" onClick={onClose} type="button" aria-label="Tutup">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="time-modal__content">
          <div className="time-modal__field">
            <label className="time-modal__label" htmlFor="time-input">Jam (Waktu Roleplay)</label>
            <input
              id="time-input"
              className="time-modal__input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <span className="time-modal__hint">
              Jam akan <b>otomatis maju 5 menit</b> setiap kali Anda mengirim pesan baru.
            </span>
          </div>

          <div className="time-modal__field">
            <label className="time-modal__label" htmlFor="date-input">Tanggal Kejadian (Opsional)</label>
            <input
              id="date-input"
              className="time-modal__input"
              type="text"
              placeholder="Contoh: 14 Februari 2026, Musim Dingin"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <span className="time-modal__hint">
              Tanggal ini akan digunakan sebagai patokan cerita, dan otomatis disisipkan pada hasil fitur <b>Ringkasan (Summarize)</b>.
            </span>
          </div>
        </div>

        <div className="time-modal__footer">
          <button className="time-modal__btn time-modal__btn--ghost" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="time-modal__btn time-modal__btn--primary" type="button" onClick={handleSave}>
            Simpan Konteks
          </button>
        </div>
      </section>
    </>
  );
}
