import React, { useState, useEffect, useRef } from 'react';
import './AvatarPopup.css';

export default function AvatarPopup({ data, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  
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
  };

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [data]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!data) return null;

  const { src, name, isUser, themeClass } = data;
  const bubbleClass = isUser ? 'message__bubble--user' : 'message__bubble--ai';

  return (
    <div 
      className={`avatar-popup__overlay ${isVisible ? 'avatar-popup__overlay--visible' : ''}`} 
      onClick={handleClose}
    >
      <div 
        ref={popupRef}
        className={`avatar-popup__wrapper ${bubbleClass} ${themeClass}`}
        style={{ cursor: isDraggingState ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => e.stopPropagation()} 
      >
        <img src={src} alt={name} className="avatar-popup__image" />
      </div>
    </div>
  );
}
