import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';

interface FlipCardProps {
  digit: string | number;
  size?: 'sm' | 'md' | 'lg';
  enableSound?: boolean;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  digit,
  size = 'lg',
  enableSound = true,
}) => {
  const strDigit = String(digit);
  const [current, setCurrent] = useState<string>(strDigit);
  const [previous, setPrevious] = useState<string>(strDigit);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipKey, setFlipKey] = useState<number>(0);

  const soundRef = useRef(enableSound);
  soundRef.current = enableSound;

  const currentRef = useRef(current);
  currentRef.current = current;

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (strDigit !== currentRef.current) {
      // Cancel any in-progress flip
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const oldDigit = currentRef.current;

      // Batch all state updates together
      setPrevious(oldDigit);
      setCurrent(strDigit);
      setIsFlipping(true);
      setFlipKey((k) => k + 1);

      if (soundRef.current) {
        audioService.playFlip();
      }

      // Clean up animation after it completes (600ms total: fold 0.3s + unfold 0.3s)
      timerRef.current = window.setTimeout(() => {
        setIsFlipping(false);
        timerRef.current = null;
      }, 50);
    }
    // Only react to the incoming digit prop changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strDigit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={`flip-card size-${size}`}>
      {/*
        STATIC LAYERS — always show the CURRENT (newest) digit.
        These are the "destination" state. The animated leaves
        provide the visual transition ON TOP of these.
      */}
      <div className="flip-half flip-half-top">
        <span className="flip-digit-text">{current}</span>
      </div>

      <div className="flip-half flip-half-bottom">
        <span className="flip-digit-text">{current}</span>
      </div>

      {/* ANIMATED LEAVES — only present during a flip transition */}
      {isFlipping && (
        <>
          {/*
            FRONT LEAF (top half):
            Shows the OLD digit's top half.
            Starts flat (covering static top) then folds DOWN to -90°,
            revealing the static top (new digit) behind it.
          */}
          <div key={`front-${flipKey}`} className="flip-leaf-front">
            <div className="flip-half flip-half-top" style={{ position: 'relative', height: '100%' }}>
              <span className="flip-digit-text">{previous}</span>
              <div className="flip-shadow-overlay" />
            </div>
          </div>

          {/*
            BACK LEAF (bottom half):
            Shows the NEW digit's bottom half.
            Starts at 90° (edge-on, hidden) then unfolds DOWN to 0°,
            landing flush on the static bottom (same digit — seamless).
          */}
          <div key={`back-${flipKey}`} className="flip-leaf-back">
            <div className="flip-half flip-half-bottom" style={{ position: 'relative', height: '100%' }}>
              <span className="flip-digit-text">{current}</span>
              <div className="flip-shadow-overlay" />
            </div>
          </div>
        </>
      )}

      {/* Mechanical hinge pins */}
      <div className="flip-hinge-left" />
      <div className="flip-hinge-right" />
    </div>
  );
};
