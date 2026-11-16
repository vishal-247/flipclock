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
  const [flipId, setFlipId] = useState<number>(0);

  const soundRef = useRef<boolean>(enableSound);
  soundRef.current = enableSound;

  const currentRef = useRef<string>(current);
  currentRef.current = current;

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // When incoming digit changes from the currently displayed value
    if (strDigit !== currentRef.current) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      const prev = currentRef.current;
      setPrevious(prev);
      setCurrent(strDigit);
      setIsFlipping(true);
      setFlipId((id) => id + 1);

      if (soundRef.current) {
        audioService.playFlip();
      }

      // 450ms covers the total 420ms animation with a safe margin
      timerRef.current = window.setTimeout(() => {
        setIsFlipping(false);
        setPrevious(strDigit);
        timerRef.current = null;
      }, 450);
    }
  }, [strDigit]); // ONLY depend on strDigit so effect cleanup doesn't prematurely cancel timer!

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // When bottom leaf unfolds completely to 0deg, settle the card immediately
    if (e.animationName.includes('flip-unfold')) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsFlipping(false);
      setPrevious(current);
    }
  };

  return (
    <div className={`flip-card size-${size}`}>
      {/* 1. Static Top: shows the incoming current value */}
      <div className="flip-half flip-half-top">
        <span className="flip-digit-text">{current}</span>
      </div>

      {/* 2. Static Bottom: shows previous during flip, current at rest */}
      <div className="flip-half flip-half-bottom">
        <span className="flip-digit-text">{isFlipping ? previous : current}</span>
      </div>

      {/* 3. Animating Leaves when flipping */}
      {isFlipping && (
        <>
          {/* Top Leaf folds down (showing previous digit top half) */}
          <div key={`front-${flipId}`} className="flip-leaf-front">
            <div className="flip-half flip-half-top">
              <span className="flip-digit-text">{previous}</span>
              <div className="flip-shadow-overlay" />
            </div>
          </div>

          {/* Bottom Leaf unfolds down (showing current digit bottom half) */}
          <div
            key={`back-${flipId}`}
            className="flip-leaf-back"
            onAnimationEnd={handleAnimationEnd}
          >
            <div className="flip-half flip-half-bottom">
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
