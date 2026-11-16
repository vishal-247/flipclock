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
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (strDigit !== current) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      setPrevious(current);
      setCurrent(strDigit);
      setIsFlipping(true);
      setFlipId((prev) => prev + 1);

      if (enableSound) {
        audioService.playFlip();
      }

      timerRef.current = window.setTimeout(() => {
        setIsFlipping(false);
        setPrevious(strDigit);
      }, 450);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [strDigit, current, enableSound]);

  return (
    <div className={`flip-card size-${size}`}>
      {/* 1. Static Top: shows the incoming current value */}
      <div className="flip-half flip-half-top">
        <span className="flip-digit-text">{current}</span>
      </div>

      {/* 2. Static Bottom: shows the outgoing previous value until new unfolds */}
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
          <div key={`back-${flipId}`} className="flip-leaf-back">
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
