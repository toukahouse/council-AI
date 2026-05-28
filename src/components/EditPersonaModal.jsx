import { useState, useEffect } from 'react';
import './EditCharacterModal.css'; // Re-using styles from edit character

const initialFormData = {
  name: '',
  role: '',
  description: '',
};

export default function EditPersonaModal({ isOpen, onClose, data, onSave }) {
  const [formData, setFormData] = useState(initialFormData);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarName, setAvatarName] = useState('Belum ada file');

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        role: data.role || '',
        description: data.description || '',
      });
      setAvatarPreview(data.avatar || '');
    } else {
      setFormData(initialFormData);
      setAvatarPreview('');
    }
  }, [data]);

  const handleFieldChange = (key) => (event) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setAvatarPreview('');
      setAvatarName('Belum ada file');
      return;
    }

    setAvatarName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (data) {
      setFormData({
        name: data.name || '',
        role: data.role || '',
        description: data.description || '',
      });
      setAvatarPreview(data.avatar || '');
    } else {
      setFormData(initialFormData);
      setAvatarPreview('');
      setAvatarName('Belum ada file');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ ...formData, avatarPreview });
    }
  };

  return (
    <>
      <div
        className={`edit-modal__overlay ${isOpen ? 'edit-modal__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <section
        className={`edit-modal ${isOpen ? 'edit-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-persona-title"
      >
        <div className="edit-modal__panel" onClick={(event) => event.stopPropagation()}>
          <div className="edit-modal__header">
            <div>
              <span className="edit-modal__eyebrow">Edit Persona</span>
              <h2 className="edit-modal__title" id="edit-persona-title">Profil Avatar User</h2>
              <p className="edit-modal__subtitle">
                Atur identitas, deskripsi singkat, dan latar belakang persona untuk roleplay.
              </p>
            </div>
            <button className="edit-modal__close" onClick={onClose} type="button" aria-label="Tutup">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="edit-modal__content">
            <div className="edit-modal__body" style={{ gridTemplateColumns: '1fr' }}>
              <div className="edit-modal__column">
                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-persona-avatar">Avatar Persona</label>
                  <div className="edit-modal__upload">
                    <div className="edit-modal__upload-preview">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview avatar" />
                      ) : (
                        <span className="edit-modal__upload-placeholder">Upload</span>
                      )}
                    </div>
                    <div className="edit-modal__upload-info">
                      <span className="edit-modal__upload-name">{avatarName}</span>
                      <span className="edit-modal__upload-hint">PNG, JPG max 2MB</span>
                      <label className="edit-modal__upload-action" htmlFor="modal-persona-avatar">
                        Pilih file
                      </label>
                      <input
                        id="modal-persona-avatar"
                        type="file"
                        accept="image/*"
                        className="edit-modal__upload-input"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-persona-name">Nama Persona</label>
                  <input
                    id="modal-persona-name"
                    className="edit-modal__input"
                    placeholder="Contoh: Master Commander"
                    value={formData.name}
                    onChange={handleFieldChange('name')}
                  />
                </div>

                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-persona-role">Deskripsi Singkat</label>
                  <input
                    id="modal-persona-role"
                    className="edit-modal__input"
                    placeholder="Contoh: Seorang pengembara misterius"
                    value={formData.role}
                    onChange={handleFieldChange('role')}
                  />
                </div>

                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-persona-desc">Background, Role, and Traits</label>
                  <textarea
                    id="modal-persona-desc"
                    className="edit-modal__textarea"
                    placeholder="Ceritakan latar belakang, peran, dan sifat agar AI lebih memahamimu"
                    rows="6"
                    value={formData.description}
                    onChange={handleFieldChange('description')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="edit-modal__footer">
            <span className="edit-modal__footer-note">Perubahan ini akan diterapkan secara global.</span>
            <div className="edit-modal__actions">
              <button className="edit-modal__btn edit-modal__btn--ghost" type="button" onClick={handleReset}>
                Reset
              </button>
              <button className="edit-modal__btn edit-modal__btn--primary" type="button" onClick={handleSave}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
