import React from 'react';
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
  return (
    <nav className="app-nav" aria-label="Main Navigation">
      <div className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'clock' ? 'active' : ''}`}
          onClick={() => onTabChange('clock')}
        >
          <Clock size={16} />
          <span>Clock</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => onTabChange('timer')}
        >
          <Hourglass size={16} />
          <span>Timer</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => onTabChange('pomodoro')}
        >
          <Timer size={16} />
          <span>Pomodoro</span>
        </button>
      </div>
    </nav>
  );
};
