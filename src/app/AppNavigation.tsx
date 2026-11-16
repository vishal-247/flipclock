import React, { useState, useRef, useEffect } from 'react';
import { Clock, Hourglass, Timer } from 'lucide-react';

export type ActiveTab = 'clock' | 'timer' | 'pomodoro';

interface AppNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  const islandRef = useRef<HTMLDivElement | null>(null);
  const eyesTrackRef = useRef<HTMLDivElement | null>(null);
  const leaveTimerRef = useRef<number | null>(null);

  const isExpanded = isHovered || isTouched;

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // 250ms fluid debounce so moving the mouse between buttons doesn't abruptly snap closed
    leaveTimerRef.current = window.setTimeout(() => {
      setIsHovered(false);
      setIsTouched(false);
      leaveTimerRef.current = null;
    }, 250);
  };

  const handleIslandClick = () => {
    if (!isExpanded) {
      setIsTouched(true);
    }
  };

  const handleTabClick = (e: React.MouseEvent, tab: ActiveTab) => {
    e.stopPropagation();
    onTabChange(tab);
  };

  // Eye tracking: make avatar eyes smoothly follow cursor across the screen
  useEffect(() => {
    if (isExpanded) return;

    let animFrameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (animFrameId) cancelAnimationFrame(animFrameId);

      animFrameId = requestAnimationFrame(() => {
        if (!islandRef.current || !eyesTrackRef.current) return;
        const rect = islandRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance === 0) {
          eyesTrackRef.current.style.transform = 'translate(0px, 0px)';
          return;
        }

        // Limit eye displacement so eyes stay naturally inside the squircle face
        const maxDistX = 5.0;
        const maxDistY = 3.8;
        const factor = Math.min(distance / 240, 1);
        const offsetX = (dx / distance) * factor * maxDistX;
        const offsetY = (dy / distance) * factor * maxDistY;

        eyesTrackRef.current.style.transform = `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px)`;
      });
    };

    const handleMouseLeaveWindow = () => {
      if (eyesTrackRef.current) {
        eyesTrackRef.current.style.transform = 'translate(0px, 0px)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
    };
  }, [isExpanded]);

  // Close on outside touch/click for mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('.dynamic-island')) {
        setIsTouched(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('touchstart', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('touchstart', handleOutsideClick);
      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  return (
    <nav className="island-wrapper" aria-label="Main Navigation">
      <div
        ref={islandRef}
        className={`dynamic-island ${isExpanded ? 'expanded' : 'contracted'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleIslandClick}
        role="navigation"
        aria-expanded={isExpanded}
        title={!isExpanded ? 'Hover or click to switch modes' : undefined}
      >
        {/* 1. Contracted Mascot State: Cute Purple Squircle with Cursor-Tracking Eyes (Image 2) */}
        <div className="island-mascot" aria-hidden={isExpanded}>
          <div className="mascot-eyes-tracker" ref={eyesTrackRef}>
            <div className="mascot-eye left" />
            <div className="mascot-eye right" />
          </div>
        </div>

        {/* 2. Expanded Glass Pill Navigation (Image 1) */}
        <div className="island-content">
          <button
            className={`island-tab-btn ${activeTab === 'clock' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, 'clock')}
            tabIndex={isExpanded ? 0 : -1}
          >
            <Clock size={16} />
            <span>Clock</span>
          </button>

          <button
            className={`island-tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, 'timer')}
            tabIndex={isExpanded ? 0 : -1}
          >
            <Hourglass size={16} />
            <span>Timer</span>
          </button>

          <button
            className={`island-tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, 'pomodoro')}
            tabIndex={isExpanded ? 0 : -1}
          >
            <Timer size={16} />
            <span>Pomodoro</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
