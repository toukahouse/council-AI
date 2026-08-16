import { useState, useEffect } from 'react';
import './EditCharacterModal.css';

const initialFormData = {
  name: '',
  shortDesc: '',
  systemPrompt: '',
  greeting: '',
  sampleDialog: '',
  personaStory: '',
};

export default function EditCharacterModal({ isOpen, onClose, data, onSave }) {
  const [formData, setFormData] = useState(initialFormData);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarName, setAvatarName] = useState('Belum ada file');

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        shortDesc: data.shortDesc || '',
        systemPrompt: data.systemPrompt || '',
        greeting: data.greeting || '',
        sampleDialog: data.sampleDialog || '',
        personaStory: data.personality || '',
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
        shortDesc: data.shortDesc || '',
        systemPrompt: data.systemPrompt || '',
        greeting: data.greeting || '',
        sampleDialog: data.sampleDialog || '',
        personaStory: data.personality || '',
      });
      setAvatarPreview(data.avatar || '');
    } else {
      setFormData(initialFormData);
      setAvatarPreview('');
      setAvatarName('Belum ada file');
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (onSave) {
      try {
        setIsSaving(true);
        await onSave({ ...formData, avatarPreview });
      } finally {
        setIsSaving(false);
      }
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
        aria-labelledby="edit-character-title"
      >
        <div className="edit-modal__panel" onClick={(event) => event.stopPropagation()}>
          <div className="edit-modal__header">
            <div>
              <span className="edit-modal__eyebrow">Edit Karakter</span>
              <h2 className="edit-modal__title" id="edit-character-title">Profil dan Instruksi AI</h2>
              <p className="edit-modal__subtitle">
                Atur identitas, gaya bicara, dan konteks agar karakter terasa konsisten.
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
            <div className="edit-modal__body">
              <div className="edit-modal__column">
                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-character-avatar">Avatar Karakter</label>
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
                      <label className="edit-modal__upload-action" htmlFor="modal-character-avatar">
                        Pilih file
                      </label>
                      <input
                        id="modal-character-avatar"
                        type="file"
                        accept="image/*"
                        className="edit-modal__upload-input"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-character-name">Nama karakter</label>
                  <input
                    id="modal-character-name"
                    type="text"
                    className="edit-modal__input"
                    placeholder="Contoh: Council AI"
                    value={formData.name}
                    onChange={handleFieldChange('name')}
                  />
                </div>

                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-character-short-desc">Deskripsi singkat karakter</label>
                  <textarea
                    id="modal-character-short-desc"
                    className="edit-modal__textarea"
                    placeholder="Contoh: Asisten AI ramah untuk ngobrol santai"
                    rows="3"
                    value={formData.shortDesc}
                    onChange={handleFieldChange('shortDesc')}
                  />
                </div>

                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-character-greeting">Pesan awal (greeting)</label>
                  <textarea
                    id="modal-character-greeting"
                    className="edit-modal__textarea"
                    placeholder="Hai! Aku siap bantu kamu hari ini."
                    rows="3"
                    value={formData.greeting}
                    onChange={handleFieldChange('greeting')}
                  />
                </div>
              </div>

              <div className="edit-modal__column">
                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-character-system-prompt">System prompt / instruction</label>
                  <textarea
                    id="modal-character-system-prompt"
                    className="edit-modal__textarea"
                    placeholder="Atur aturan utama, gaya bicara, dan batasan AI"
                    rows="4"
                    value={formData.systemPrompt}
                    onChange={handleFieldChange('systemPrompt')}
                  />
                </div>

                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-character-sample-dialog">Contoh dialog karakter</label>
                  <textarea
                    id="modal-character-sample-dialog"
                    className="edit-modal__textarea"
                    placeholder="User: Hai\nAI: Halo! Ada yang bisa kubantu?"
                    rows="4"
                    value={formData.sampleDialog}
                    onChange={handleFieldChange('sampleDialog')}
                  />
                </div>

                <div className="edit-modal__field">
                  <label className="edit-modal__label" htmlFor="modal-character-persona">Deskripsi persona / latar belakang</label>
                  <textarea
                    id="modal-character-persona"
                    className="edit-modal__textarea"
                    placeholder="Ceritakan latar belakang, penampilan, dan sifat karakter"
                    rows="5"
                    value={formData.personaStory}
                    onChange={handleFieldChange('personaStory')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="edit-modal__footer">
            <span className="edit-modal__footer-note">Perubahan diterapkan saat sesi chat baru dimulai.</span>
            <div className="edit-modal__actions">
              <button className="edit-modal__btn edit-modal__btn--ghost" type="button" onClick={handleReset}>
                Reset
              </button>
              <button 
                className="edit-modal__btn edit-modal__btn--primary" 
                type="button" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
