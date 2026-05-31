import { useState, useRef } from 'react';

export default function ChatInput({ 
  bubbleTheme, 
  isSummarizing, 
  hasPersonas, 
  personasLoaded, 
  isTyping, 
  fontSize, 
  abortController, 
  onStop, 
  onSend 
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendLocal();
    }
  };

  const handleSendLocal = () => {
    if (!inputValue.trim()) return;
    onSend(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="chat-input-wrap">
      <div className={`chat-input ${bubbleTheme?.userAnimClass || ''}`}>
        <textarea
          ref={inputRef}
          className="chat-input__textarea"
          id="chat-textarea"
          placeholder={isSummarizing ? "Sistem sedang meringkas cerita..." : (!hasPersonas && personasLoaded) ? "Buat Persona terlebih dahulu untuk mulai chat..." : "Type your message..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping || isSummarizing || (!hasPersonas && personasLoaded)}
          rows="1"
          style={{ fontSize: `${fontSize}px` }}
        />
        {abortController ? (
          <button
            className="chat-input__send chat-input__send--active"
            onClick={onStop}
            aria-label="Stop generation"
            title="Stop Generation"
            style={{ background: '#e11d48' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
          </button>
        ) : (
          <button
            className={`chat-input__send ${inputValue.trim() ? 'chat-input__send--active' : ''}`}
            id="btn-send"
            onClick={handleSendLocal}
            disabled={!inputValue.trim() || isTyping || isSummarizing || (!hasPersonas && personasLoaded)}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        )}
      </div>
      <div className="chat-input__note">
        Gunakan <strong>Shift+Enter</strong> untuk membuat baris baru. Tekan <strong>Enter</strong> untuk mengirim.
      </div>
    </div>
  );
}
