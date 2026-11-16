import React from 'react';
import { AppTheme } from '../settings/types';
import { Clock, Moon, Sun, Settings, Maximize2, Minimize2 } from 'lucide-react';

interface AppHeaderProps {
  theme: AppTheme;
  isFullscreen: boolean;
  onToggleTheme: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  theme,
  isFullscreen,
  onToggleTheme,
  onToggleFullscreen,
  onOpenSettings,
}) => {
  return (
    <header className="app-header">
      <div className="app-brand">
        <Clock className="app-brand-icon" />
        <span>My Clock</span>
      </div>

      <div className="app-header-actions">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="icon-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        <button
          className="icon-btn"
          onClick={onOpenSettings}
          title="Open settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

