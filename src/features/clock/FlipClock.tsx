import React from 'react';
import { useClock } from '../../hooks/useClock';
import { FlipUnit } from '../../components/flip/FlipUnit';
import { FlipSeparator } from '../../components/flip/FlipSeparator';
import { ClockFormat, AppTheme } from '../../settings/types';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import '../../styles/clock.css';

interface FlipClockProps {
  format: ClockFormat;
  showSeconds: boolean;
  enableSound: boolean;
  isFullscreen: boolean;
  theme: AppTheme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onToggleSeconds: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
}

export const FlipClock: React.FC<FlipClockProps> = ({
  format,
  showSeconds,
  enableSound,
  isFullscreen,
  theme,
  onToggleTheme,
  onOpenSettings,
  onToggleSeconds,
  onToggleSound,
  onToggleFullscreen,
}) => {
  const { hours, minutes, seconds, ampm, dateString, dayString } = useClock(format);

  return (
    <div className="clock-view">
      {/* Date badge & 12h indicator */}
      <div className="clock-meta-bar">
        <div className="clock-date-badge">
          <span className="clock-day-pill">{dayString}</span>
          <span>{dateString}</span>
        </div>

        {format === '12h' && (
          <div className="clock-ampm-badge">
            {ampm}
          </div>
        )}
      </div>

      {/* Flip Clock Display */}
      <div className="flip-clock-display">
        {/* Hours */}
        <FlipUnit
          value={hours}
          label="Hours"
          size="lg"
          enableSound={enableSound}
        />

        {/* Separator */}
        <FlipSeparator />

        {/* Minutes */}
        <FlipUnit
          value={minutes}
          label="Minutes"
          size="lg"
          enableSound={enableSound}
        />

        {/* Optional Seconds */}
        {showSeconds && (
          <>
            <FlipSeparator />
            <FlipUnit
              value={seconds}
              label="Seconds"
              size={isFullscreen ? 'md' : 'md'}
              enableSound={enableSound}
            />
          </>
        )}
      </div>

      {/* Clock Controls Bar */}
      <div className="clock-controls-bar">
        {/* 1. Settings Icon Button */}
        <button
          className="clock-toggle-btn"
          onClick={onOpenSettings}
          title="Open settings"
          aria-label="Settings"
        >
          <Settings size={15} />
        </button>

        {/* 2. Theme Toggle Icon Button */}
        <button
          className="clock-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* 3. Seconds Toggle Button */}
        <button
          className={`clock-toggle-btn ${showSeconds ? 'active' : ''}`}
          onClick={onToggleSeconds}
          title="Toggle seconds display"
        >
          {showSeconds ? <Eye size={15} /> : <EyeOff size={15} />}
          <span>Seconds</span>
        </button>

        {/* 4. Mute / Sound Toggle */}
        <button
          className={`clock-toggle-btn ${enableSound ? 'active' : ''}`}
          onClick={onToggleSound}
          title={enableSound ? 'Sound on' : 'Muted'}
        >
          {enableSound ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* 5. Fullscreen Toggle */}
        <button
          className="clock-toggle-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Fullscreen floating exit button when hovering */}
      {isFullscreen && (
        <button
          className="fullscreen-exit-btn"
          onClick={onToggleFullscreen}
          title="Exit Fullscreen"
        >
          <Minimize2 size={16} />
          <span>Exit Fullscreen</span>
        </button>
      )}
    </div>
  );
};
