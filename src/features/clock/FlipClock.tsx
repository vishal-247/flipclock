import React from 'react';
import { useClock } from '../../hooks/useClock';
import { FlipUnit } from '../../components/flip/FlipUnit';
import { FlipSeparator } from '../../components/flip/FlipSeparator';
import { ClockFormat } from '../../settings/types';
import { Maximize2, Minimize2, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import '../../styles/clock.css';

interface FlipClockProps {
  format: ClockFormat;
  showSeconds: boolean;
  enableSound: boolean;
  isFullscreen: boolean;
  onToggleFormat: () => void;
  onToggleSeconds: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
}

export const FlipClock: React.FC<FlipClockProps> = ({
  format,
  showSeconds,
  enableSound,
  isFullscreen,
  onToggleFormat,
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

      {/* Clock Controls */}
      <div className="clock-controls-bar">
        <button
          className={`clock-toggle-btn ${format === '24h' ? 'active' : ''}`}
          onClick={onToggleFormat}
          title="Switch 12h / 24h format"
        >
          {format === '12h' ? '12-Hour' : '24-Hour'}
        </button>

        <button
          className={`clock-toggle-btn ${showSeconds ? 'active' : ''}`}
          onClick={onToggleSeconds}
          title="Toggle seconds display"
        >
          {showSeconds ? <Eye size={15} /> : <EyeOff size={15} />}
          <span>Seconds</span>
        </button>

        <button
          className={`clock-toggle-btn ${enableSound ? 'active' : ''}`}
          onClick={onToggleSound}
          title={enableSound ? 'Sound on' : 'Muted'}
        >
          {enableSound ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

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

