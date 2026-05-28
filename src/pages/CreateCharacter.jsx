import React, { useState } from 'react';
import './FormPages.css';

const initialFormData = {
  name: '',
  shortDesc: '',
  systemPrompt: '',
  greeting: '',
  sampleDialog: '',
  personaStory: '',
};

export default function CreateCharacter({ onNavigate }) {
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
      const response = await fetch('http://localhost:3001/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          greeting: formData.greeting,
          shortDesc: formData.shortDesc,
          systemPrompt: formData.systemPrompt,
          personality: formData.personaStory,
          sampleDialog: formData.sampleDialog,
          avatar: avatarPreview || '/ai_avatar.png',
          color: '#d946ef',
        })
      });
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          onNavigate('home');
        }, 1500); // Wait 1.5s to show success before navigating
      }
    } catch (error) {
      console.error("Error creating character:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-page__container">
        <div className="form-page__header">
          <h1 className="form-page__title">Create New Character</h1>
          <p className="form-page__subtitle">Design a unique AI character for your roleplay experiences.</p>
        </div>

        <div className="form-page__content">
          <div className="form-page__field">
            <label className="form-page__label" htmlFor="char-avatar">Character Avatar</label>
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
                <label className="form-page__upload-action" htmlFor="char-avatar">
                  Choose File
                </label>
                <input
                  id="char-avatar"
                  type="file"
                  accept="image/*"
                  className="form-page__upload-input"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
          </div>

          <div className="form-page__grid">
            <div className="form-page__field">
              <label className="form-page__label" htmlFor="char-name">Character Name</label>
              <input
                id="char-name"
                className="form-page__input"
                placeholder="e.g. Lumina, Council AI"
                value={formData.name}
                onChange={handleFieldChange('name')}
              />
            </div>
            <div className="form-page__field">
              <label className="form-page__label" htmlFor="char-greeting">Greeting Message</label>
              <textarea
                id="char-greeting"
                className="form-page__textarea"
                style={{ minHeight: '60px' }}
                placeholder="e.g. Hello! I'm ready to help you today."
                value={formData.greeting}
                onChange={handleFieldChange('greeting')}
              />
            </div>
          </div>

          <div className="form-page__field">
            <label className="form-page__label" htmlFor="char-short-desc">Short Description</label>
            <textarea
              id="char-short-desc"
              className="form-page__textarea"
              style={{ minHeight: '80px' }}
              placeholder="A brief summary of the character's role or personality."
              value={formData.shortDesc}
              onChange={handleFieldChange('shortDesc')}
            />
          </div>

          <div className="form-page__grid">
            <div className="form-page__field">
              <label className="form-page__label" htmlFor="char-system-prompt">System Prompt / Instructions</label>
              <textarea
                id="char-system-prompt"
                className="form-page__textarea"
                style={{ minHeight: '160px' }}
                placeholder="Define main rules, speaking style, and AI boundaries."
                value={formData.systemPrompt}
                onChange={handleFieldChange('systemPrompt')}
              />
            </div>

            <div className="form-page__field">
              <label className="form-page__label" htmlFor="char-persona">Persona Background & Lore</label>
              <textarea
                id="char-persona"
                className="form-page__textarea"
                style={{ minHeight: '160px' }}
                placeholder="Describe the background, appearance, and traits of the character."
                value={formData.personaStory}
                onChange={handleFieldChange('personaStory')}
              />
            </div>
          </div>

          <div className="form-page__field">
            <label className="form-page__label" htmlFor="char-sample-dialog">Sample Dialog</label>
            <textarea
              id="char-sample-dialog"
              className="form-page__textarea"
              placeholder="User: Hi&#10;AI: Hello! How can I assist you today?"
              value={formData.sampleDialog}
              onChange={handleFieldChange('sampleDialog')}
            />
          </div>
        </div>

        <div className="form-page__footer">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Settings will apply when a new chat session begins.
          </div>
          <div className="form-page__actions">
            <button className="form-page__btn form-page__btn--ghost" onClick={() => onNavigate('home')} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="form-page__btn form-page__btn--primary" onClick={handleCreate} disabled={isSubmitting || showSuccess}>
              {isSubmitting ? 'Creating...' : showSuccess ? 'Success!' : 'Create Character'}
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
                  Character Created Successfully!
                </>
              ) : (
                'Creating Character. Please wait...'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
