import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';

interface FlipCardProps {
  digit: string | number;
  size?: 'sm' | 'md' | 'lg';
  enableSound?: boolean;
}

/**
 * Split-flap flip card with physically accurate timing:
 *
 *   T = 0 ms    Front leaf starts folding (old digit top half folds away)
 *   T = 300 ms  Front leaf reaches -90°, reveals static top → new digit
 *   T = 300 ms  Back leaf starts unfolding from 90° (new digit bottom half)
 *   T = 525 ms  Back leaf ~75 % unfolded, nearly flat → static bottom
 *               safely switches from old → new (hidden behind leaf)
 *   T = 600 ms  Back leaf lands at 0°
 *   T = 650 ms  Animated leaves removed, card at rest
 *
 * Static top:    always shows `current` (hidden behind front-leaf at start)
 * Static bottom: shows `previous` until the back-leaf covers it, then `current`
 */
export const FlipCard: React.FC<FlipCardProps> = ({
  digit,
  size = 'lg',
  enableSound = true,
}) => {
  const strDigit = String(digit);

  const [current, setCurrent] = useState(strDigit);
  const [previous, setPrevious] = useState(strDigit);
  const [bottomDisplay, setBottomDisplay] = useState(strDigit);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  // Refs so the effect only depends on strDigit
  const soundRef = useRef(enableSound);
  soundRef.current = enableSound;

  const currentRef = useRef(current);
  currentRef.current = current;

  const endTimerRef = useRef<number | null>(null);
  const bottomTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (strDigit !== currentRef.current) {
      // Clear any in-progress timers
      if (endTimerRef.current) {
        window.clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
      if (bottomTimerRef.current) {
        window.clearTimeout(bottomTimerRef.current);
        bottomTimerRef.current = null;
      }

      const oldDigit = currentRef.current;

      // Kick off the flip
      setPrevious(oldDigit);
      setCurrent(strDigit);
      setBottomDisplay(oldDigit);   // bottom keeps OLD digit for now
      setIsFlipping(true);
      setFlipKey((k) => k + 1);

      if (soundRef.current) {
        audioService.playFlip();
      }

      // At ~75 % of the back-leaf unfold the leaf is nearly flat and
      // fully covers the static bottom → safe to swap the digit behind it.
      // Back-leaf: 0.3 s delay + 0.3 s duration → 75 % = 0.3 + 0.225 = 0.525 s
      const capturedDigit = strDigit;
      bottomTimerRef.current = window.setTimeout(() => {
        setBottomDisplay(capturedDigit);
        bottomTimerRef.current = null;
      }, 525);

      // Remove animated leaves after full animation completes
      endTimerRef.current = window.setTimeout(() => {
        setIsFlipping(false);
        endTimerRef.current = null;
      }, 650);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strDigit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
      if (bottomTimerRef.current) window.clearTimeout(bottomTimerRef.current);
    };
  }, []);

  return (
    <div className={`flip-card size-${size}`}>
      {/*
        STATIC TOP — always shows the NEW digit.
        Hidden behind the front-leaf (old digit) at the start;
        revealed when the front-leaf folds past ~45°.
      */}
      <div className="flip-half flip-half-top">
        <span className="flip-digit-text">{current}</span>
      </div>

      {/*
        STATIC BOTTOM — shows the OLD digit while the back-leaf
        is unfolding over it, then switches to the NEW digit once
        the leaf is opaque enough to hide the swap (~75 % unfolded).
      */}
      <div className="flip-half flip-half-bottom">
        <span className="flip-digit-text">{bottomDisplay}</span>
      </div>

      {/* ANIMATED LEAVES — only present during a flip */}
      {isFlipping && (
        <>
          {/* Front leaf: OLD digit top-half, folds down 0° → -90° */}
          <div key={`front-${flipKey}`} className="flip-leaf-front">
            <div className="flip-half flip-half-top" style={{ position: 'relative', height: '100%' }}>
              <span className="flip-digit-text">{previous}</span>
              <div className="flip-shadow-overlay" />
            </div>
          </div>

          {/* Back leaf: NEW digit bottom-half, unfolds 90° → 0° */}
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
