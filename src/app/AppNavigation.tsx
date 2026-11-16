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
        className={`dynamic-island ${isExpanded ? 'expanded' : 'contracted'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleIslandClick}
        role="navigation"
        aria-expanded={isExpanded}
        title={!isExpanded ? 'Hover or click to switch modes' : undefined}
      >
        {/* 1. Contracted Mascot State: Cute Purple Squircle (Image 2) */}
        <div className="island-mascot" aria-hidden={isExpanded}>
          <div className="mascot-eye left" />
          <div className="mascot-eye right" />
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
