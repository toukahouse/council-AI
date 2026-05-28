import React, { useEffect, useState, useRef } from 'react';
import './CardPopup.css';

const AccordionPanel = ({ title, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card-popup__panel">
      <div 
        className="card-popup__panel-header" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        <span>{title}</span>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      {isOpen && (
        <div className="card-popup__panel-content">{content}</div>
      )}
    </div>
  );
};

export default function CardPopup({ data, type, onClose, onNavigate, onDelete, onEditCharacter, onEditPersona }) {
  const [isVisible, setIsVisible] = useState(false);
  const [recentConversation, setRecentConversation] = useState(null);

  // Physics Drag State
  const popupRef = useRef(null);
  const isDragging = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);

  const startSpringLoop = () => {
    if (animationFrame.current) return;
    
    const stiffness = 0.12;
    const damping = 0.75;
    
    const loop = () => {
      const ax = (targetPos.current.x - currentPos.current.x) * stiffness;
      const ay = (targetPos.current.y - currentPos.current.y) * stiffness;
      
      velocity.current.x = (velocity.current.x + ax) * damping;
      velocity.current.y = (velocity.current.y + ay) * damping;
      
      currentPos.current.x += velocity.current.x;
      currentPos.current.y += velocity.current.y;
      
      if (popupRef.current) {
        popupRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }
      
      // Stop loop if resting and not dragging
      if (!isDragging.current && 
          Math.abs(velocity.current.x) < 0.05 && 
          Math.abs(velocity.current.y) < 0.05 &&
          Math.abs(targetPos.current.x - currentPos.current.x) < 0.05 &&
          Math.abs(targetPos.current.y - currentPos.current.y) < 0.05) {
        animationFrame.current = null;
        return;
      }
      
      animationFrame.current = requestAnimationFrame(loop);
    };
    
    animationFrame.current = requestAnimationFrame(loop);
  };

  const handlePointerDown = (e) => {
    isDragging.current = true;
    setIsDraggingState(true);
    dragStart.current = {
      x: e.clientX - targetPos.current.x,
      y: e.clientY - targetPos.current.y
    };
    e.target.setPointerCapture(e.pointerId);
    startSpringLoop();
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    targetPos.current.x = e.clientX - dragStart.current.x;
    targetPos.current.y = e.clientY - dragStart.current.y;
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    setIsDraggingState(false);
    e.target.releasePointerCapture(e.pointerId);
    // targetPos.current = { x: 0, y: 0 }; // Uncomment if it should snap back to center! 
    // Let's leave it to stay where dropped, it feels better for a modal!
  };

  useEffect(() => {
    if (data) {
      // Small delay to trigger animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      
      // Check if character has a recent conversation
      if (type === 'character') {
        fetch(`/api/characters/${data.id}/recent-conversation`)
          .then(res => res.json())
          .then(conversation => {
            if (conversation && conversation.id) {
              setRecentConversation(conversation);
            } else {
              setRecentConversation(null);
            }
          })
          .catch(err => console.error("Error fetching messages:", err));
      }
      
      return () => clearTimeout(timer);
    }
  }, [data, type]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: data.id })
      });
      if (res.ok) {
        const newConv = await res.json();
        onNavigate('chat', newConv);
      } else {
        const errData = await res.json();
        console.error("Backend error creating conversation:", errData);
        alert(`Gagal membuat sesi chat. Server Error: ${errData.details || 'Unknown'}\n\nPastikan 'npx prisma db push --force-reset' sukses dijalankan.`);
      }
    } catch (err) {
      console.error("Error creating new conversation:", err);
    }
  };

  if (!data) return null;

  const isCharacter = type === 'character';

  return (
    <div className={`card-popup__overlay ${isVisible ? 'card-popup__overlay--visible' : ''}`} onClick={handleClose}>
      <div 
        ref={popupRef}
        className={`card-popup ${isVisible ? 'card-popup--open' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ '--card-color': data.color || '#a78bfa', cursor: isDraggingState ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <button className="card-popup__close" onClick={handleClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* LEFT COLUMN */}
        <div className="card-popup__left">
          <div className="card-popup__image-wrap">
            <img src={data.avatar} alt={data.name} className="card-popup__image" />
          </div>
          <div className="card-popup__info">
            <div className="card-popup__name-badge">
              {data.name}
            </div>
            
            <div className="card-popup__desc" dangerouslySetInnerHTML={{ __html: isCharacter ? (data.shortDesc || '') : (data.role || data.description || '') }}></div>
            
            <div className="card-popup__actions">
              {isCharacter ? (
                <>
                  {recentConversation && (
                    <button className="card-popup__btn card-popup__btn--primary" onClick={() => onNavigate('chat', recentConversation)}>
                      Continue Chat
                    </button>
                  )}
                  <button className={`card-popup__btn ${recentConversation ? 'card-popup__btn--secondary' : 'card-popup__btn--primary'}`} onClick={handleNewConversation}>
                    {recentConversation ? 'Start New Conversation' : 'Start Conversation'}
                  </button>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="card-popup__btn card-popup__btn--secondary" onClick={onEditCharacter} style={{ flex: 1, borderColor: '#3b82f6', color: '#3b82f6' }}>
                      Edit
                    </button>
                    <button className="card-popup__btn card-popup__btn--secondary" onClick={onDelete} style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}>
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button className="card-popup__btn card-popup__btn--primary" onClick={onEditPersona}>
                    Edit Persona
                  </button>
                  <button className="card-popup__btn card-popup__btn--secondary" onClick={onDelete} style={{ marginTop: '12px', borderColor: '#ef4444', color: '#ef4444' }}>
                    Delete Persona
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="card-popup__right">
          {isCharacter ? (
            <>
              <AccordionPanel 
                title="System Prompt" 
                content={data.systemPrompt || 'No system prompt defined.'} 
                defaultOpen={true}
              />
              <AccordionPanel 
                title="Persona Lore" 
                content={data.personality || 'No persona lore defined.'} 
              />
            </>
          ) : (
            <>
              <AccordionPanel 
                title="Persona" 
                content={data.description || 'No persona defined.'} 
                defaultOpen={true}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
