import { useState, useRef } from 'react';
import TokenCounter from './TokenCounter';

export default function ChatInput({ 
  bubbleTheme, 
  isSummarizing, 
  hasPersonas, 
  personasLoaded, 
  isTyping, 
  fontSize, 
  abortController, 
  onStop, 
  onSend,
  onOpenDiceModal,
  onTriggerEventDirector,
  // Token counter props
  characterData,
  activePersona,
  memories = [],
  npcs = [],
  messages = [],
  historyLimit = 30,
  roleplayTime = '',
  roleplayDate = '',
  lastOutputTokens = 0,
  totalOutputTokens = 0,
  contextWindowLimit = 32768,
  showTokenCounter = true,
  onToggleTokenCounter
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

        {/* Action Button: D20 Dice Modal */}
        <button
          type="button"
          className="chat-input__action-btn"
          onClick={() => onOpenDiceModal && onOpenDiceModal(inputValue)}
          title="Lempar Dadu D20 Interaktif (TRPG)"
          aria-label="Lempar Dadu D20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 7h.01" />
            <path d="M17 7h.01" />
            <path d="M7 17h.01" />
            <path d="M17 17h.01" />
            <path d="M12 12h.01" />
          </svg>
        </button>

        {/* Action Button: Event Director Spontaneous Initiative */}
        <button
          type="button"
          className="chat-input__action-btn chat-input__action-btn--event"
          onClick={onTriggerEventDirector}
          disabled={isTyping || isSummarizing || (!hasPersonas && personasLoaded)}
          title="Biarkan Karakter Mengambil Inisiatif Spontan (Event Director)"
          aria-label="Inisiatif Karakter"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </button>

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
        <span className="chat-input__note-hint">
          Gunakan <strong>Shift+Enter</strong> untuk baris baru. Tekan <strong>Enter</strong> untuk mengirim.
        </span>

        <TokenCounter
          characterData={characterData}
          activePersona={activePersona}
          memories={memories}
          npcs={npcs}
          history={messages}
          historyLimit={historyLimit}
          roleplayTime={roleplayTime}
          roleplayDate={roleplayDate}
          draftMessage={inputValue}
          lastOutputTokens={lastOutputTokens}
          totalOutputTokens={totalOutputTokens}
          contextWindowLimit={contextWindowLimit}
          isVisible={showTokenCounter}
          onToggleVisibility={onToggleTokenCounter}
        />
      </div>
    </div>
  );
}

