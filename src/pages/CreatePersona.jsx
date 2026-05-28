import React, { useState } from 'react';
import './FormPages.css';

const initialFormData = {
  name: '',
  role: '',
  description: '',
};

export default function CreatePersona({ onNavigate }) {
  const [formData, setFormData] = useState(initialFormData);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarName, setAvatarName] = useState('Belum ada file');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          description: formData.description,
          avatar: avatarPreview || '/ai_avatar.png',
          color: '#3b82f6',
        })
      });
      if (response.ok) {
        const newPersona = await response.json();
        if (!localStorage.getItem('defaultPersonaId')) {
          localStorage.setItem('defaultPersonaId', newPersona.id);
        }
        setShowSuccess(true);
        setTimeout(() => {
          onNavigate('home');
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating persona:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-page__container" style={{ maxWidth: '600px' }}>
        <div className="form-page__header">
          <h1 className="form-page__title">Create New Persona</h1>
          <p className="form-page__subtitle">Define your identity and background for the roleplay.</p>
        </div>

        <div className="form-page__content">
          <div className="form-page__field">
            <label className="form-page__label" htmlFor="persona-avatar">Persona Avatar</label>
            <div className="form-page__upload">
              <div className="form-page__upload-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview avatar" />
                ) : (
                  <span className="form-page__upload-placeholder">Upload</span>
                )}
              </div>
              <div className="form-page__upload-info">
                <span className="form-page__upload-name">{avatarName}</span>
                <span className="form-page__upload-hint">PNG, JPG max 2MB</span>
                <label className="form-page__upload-action" htmlFor="persona-avatar">
                  Choose File
                </label>
                <input
                  id="persona-avatar"
                  type="file"
                  accept="image/*"
                  className="form-page__upload-input"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
          </div>

          <div className="form-page__field">
            <label className="form-page__label" htmlFor="persona-name">Persona Name</label>
            <input
              id="persona-name"
              className="form-page__input"
              placeholder="e.g. Master Commander, John Doe"
              value={formData.name}
              onChange={handleFieldChange('name')}
            />
          </div>

          <div className="form-page__field">
            <label className="form-page__label" htmlFor="persona-role">Deskripsi Singkat</label>
            <input
              id="persona-role"
              className="form-page__input"
              placeholder="e.g. Seorang pengembara yang mencari kebenaran..."
              value={formData.role}
              onChange={handleFieldChange('role')}
            />
          </div>

          <div className="form-page__field">
            <label className="form-page__label" htmlFor="persona-desc">Background, Role, and Traits</label>
            <textarea
              id="persona-desc"
              className="form-page__textarea"
              style={{ minHeight: '160px' }}
              placeholder="Describe your background, personality, and role so the AI understands who you are and how it should interact with you."
              value={formData.description}
              onChange={handleFieldChange('description')}
            />
          </div>
        </div>

        <div className="form-page__footer">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            This persona will be available to select before starting a chat.
          </div>
          <div className="form-page__actions">
            <button className="form-page__btn form-page__btn--ghost" onClick={() => onNavigate('home')} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="form-page__btn form-page__btn--primary" onClick={handleCreate} disabled={isSubmitting || showSuccess}>
              {isSubmitting ? 'Creating...' : showSuccess ? 'Success!' : 'Create Persona'}
            </button>
          </div>
        </div>

        {/* Global Loading / Success Overlay */}
        {(isSubmitting || showSuccess) && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-panel)', padding: '20px 40px', borderRadius: '12px', color: showSuccess ? '#10b981' : 'var(--text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {showSuccess ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Persona Created Successfully!
                </>
              ) : (
                'Creating Persona. Please wait...'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
