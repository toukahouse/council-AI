import { useState, useEffect } from 'react';
import './ChatMessage.css';

const ChatMessageComponent = ({ message, seqId, isTyping, animate, charName, charAvatar, userName, userAvatar, onEdit, onDelete, onRegenerate, bubbleTheme, onAvatarClick }) => {
  const [showThoughts, setShowThoughts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const isUser = message.role === 'user';
  const [elapsedMs, setElapsedMs] = useState(() => {
    if (message.endTime && message.startTime) return message.endTime - message.startTime;
    if (message.startTime) return Math.max(0, Date.now() - message.startTime);
    return 0;
  });

  useEffect(() => {
    let interval;
    if (message.isGenerating && message.startTime) {
      setElapsedMs(Date.now() - message.startTime);
      interval = setInterval(() => {
        setElapsedMs(Date.now() - message.startTime);
      }, 100);
    } else if (message.endTime && message.startTime) {
      setElapsedMs(message.endTime - message.startTime);
    } else if (!message.isGenerating && message.startTime && elapsedMs === 0) {
      setElapsedMs(Date.now() - message.startTime);
    }
    return () => clearInterval(interval);
  }, [message.isGenerating, message.startTime, message.endTime]);
  
  const aiName = charName || 'Council AI';
  const aiAvatar = charAvatar || '/ai_avatar.png';
  const displayUserName = userName || 'User';
  const displayUserAvatar = userAvatar || '/user_avatar.png';

  const animClass = isUser 
    ? (bubbleTheme?.userAnimClass || '')
    : (bubbleTheme?.aiAnimClass || '');

  const formatContent = (text) => {
    if (!text) return { __html: '' };
    // Escape HTML first to prevent XSS
    const escaped = text.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
    // Replace **text** with bold, italic, and colored span
    let formatted = escaped.replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: bold; font-style: italic; color: var(--text-bold-color, #eab308);">$1</span>');
    // Replace *text* with italic span
    formatted = formatted.replace(/\*(.*?)\*/g, '<span style="font-style: italic;">$1</span>');
    // Replace \n with <br/> for line breaks
    return { __html: formatted.replace(/\n/g, '<br/>') };
  };

  return (
    <div 
      className={`message ${isUser ? 'message--user' : 'message--ai'} ${animate ? 'message--animate' : ''}`}
      style={{ position: 'relative', zIndex: (showMenu || showThoughts) ? 50 : 1 }}
    >
      {/* AI Avatar - always on the left */}
      {!isUser && (
        <div className="message__avatar-wrap">
          <img
            src={aiAvatar}
            alt="AI"
            className="message__avatar message__avatar--ai"
            style={{ cursor: 'pointer' }}
            onClick={() => onAvatarClick && onAvatarClick({ src: aiAvatar, name: aiName, isUser: false })}
          />
          <span className="message__avatar-glow"></span>
        </div>
      )}

      <div className="message__content-wrap">
        {!isUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="message__name">{aiName}</span>
            {(message.thoughtProcess || message.isThinking) && (
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowThoughts(!showThoughts)}
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px', 
                    display: 'flex', alignItems: 'center', 
                    color: message.isThinking ? '#eab308' : '#8b5cf6',
                    opacity: message.isThinking ? (Math.floor(Date.now() / 500) % 2 === 0 ? 1 : 0.6) : 1,
                    transition: 'opacity 0.2s'
                  }}
                  title="View Thought Process"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18h6"></path>
                    <path d="M10 22h4"></path>
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                  </svg>
                </button>
                {showThoughts && message.thoughtProcess && (
                  <div style={{ 
                    position: 'absolute', top: '100%', left: 0, zIndex: 100, 
                    background: '#111118', border: '1px solid rgba(139, 92, 246, 0.4)', 
                    borderRadius: '8px', padding: '10px', minWidth: '320px', maxWidth: '400px', 
                    maxHeight: '250px', overflowY: 'auto', boxShadow: '0 12px 30px rgba(0,0,0,0.8)', 
                    fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px',
                    fontFamily: 'monospace', whiteSpace: 'pre-wrap'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#8b5cf6', borderBottom: '1px solid rgba(139, 92, 246, 0.2)', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 2-9h5"/></svg>
                      Real-time Thought Process
                    </div>
                    {message.thoughtProcess.replace(/\$?\\rightarrow\$?/g, '→')}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="message__name" style={{ alignSelf: 'flex-end' }}>{displayUserName}</span>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
          <div className={`message__bubble ${isUser ? 'message__bubble--user' : 'message__bubble--ai'} ${animClass}`}>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', minWidth: '250px', maxWidth: '100%' }}>
                <textarea 
                  value={editContent} 
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'inherit', resize: 'vertical', minHeight: '150px', borderRadius: '6px', padding: '12px', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.5' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'inherit', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                  <button onClick={() => { onEdit && onEdit(message.id, editContent); setIsEditing(false); }} style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                </div>
              </div>
            ) : (isTyping || (!message.content && !isUser && message.isGenerating)) ? (
              <div className="message__typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <p className="message__text" dangerouslySetInnerHTML={formatContent(message.content)}></p>
            )}
          </div>
          
          {/* Options Menu Button */}
          {!isTyping && message.id !== 'greeting' && !isEditing && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px 10px', borderRadius: '8px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                title="Options"
              >⋮</button>
              
              {showMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />
                  <div style={{ position: 'absolute', top: '100%', [isUser ? 'left' : 'right']: 0, background: '#181825', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', zIndex: 100, padding: '4px', minWidth: '120px', boxShadow: '0 8px 24px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', gap: '2px', backdropFilter: 'blur(10px)' }}>
                    {seqId && <div style={{ width: '100%', textAlign: 'center', padding: '4px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2px' }}>ID: {seqId}</div>}
                    <button 
                      onClick={() => { setIsEditing(true); setEditContent(message.content); setShowMenu(false); }} 
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={(e) => e.target.style.background = 'none'}
                    >Edit</button>
                    <button 
                      onClick={() => { onRegenerate && onRegenerate(message.id); setShowMenu(false); }} 
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={(e) => e.target.style.background = 'none'}
                    >{isUser ? 'Resend' : 'Regenerate'}</button>
                    <button 
                      onClick={() => { onDelete && onDelete(message.id); setShowMenu(false); }} 
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(225,29,72,0.1)'}
                      onMouseOut={(e) => e.target.style.background = 'none'}
                    >Delete</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
          {message.startTime && (
            <span className="message__time" style={{ color: 'var(--accent)', opacity: 0.8 }}>
              {(elapsedMs / 1000).toFixed(1)}s
            </span>
          )}
          <span className="message__time">{message.time}</span>
        </div>
      </div>

      {/* User Avatar - always on the right */}
      {isUser && (
        <div className="message__avatar-wrap">
          <img
            src={displayUserAvatar}
            alt="User"
            className="message__avatar message__avatar--user"
            style={{ cursor: 'pointer' }}
            onClick={() => onAvatarClick && onAvatarClick({ src: displayUserAvatar, name: displayUserName, isUser: true })}
          />
        </div>
      )}
    </div>
  );
};

import React from 'react';

export default React.memo(ChatMessageComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isThinking === nextProps.message.isThinking &&
    prevProps.message.isGenerating === nextProps.message.isGenerating &&
    prevProps.message.thoughtProcess === nextProps.message.thoughtProcess &&
    prevProps.isTyping === nextProps.isTyping &&
    prevProps.bubbleTheme === nextProps.bubbleTheme &&
    prevProps.charAvatar === nextProps.charAvatar &&
    prevProps.userAvatar === nextProps.userAvatar
  );
});
