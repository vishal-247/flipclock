import React, { useState } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { FlipUnit } from '../../components/flip/FlipUnit';
import { FlipSeparator } from '../../components/flip/FlipSeparator';
import { Play, Pause, RotateCcw, Sliders, Check } from 'lucide-react';
import '../../styles/timer.css';

interface CountdownTimerProps {
  enableSound: boolean;
  enableNotification: boolean;
  isFullscreen: boolean;
}

const PRESETS = [
  { label: '1 min', sec: 60 },
  { label: '5 min', sec: 300 },
  { label: '10 min', sec: 600 },
  { label: '15 min', sec: 900 },
  { label: '30 min', sec: 1800 },
];

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  enableSound,
  enableNotification,
  isFullscreen,
}) => {
  const {
    hours,
    minutes,
    seconds,
    targetDurationSec,
    status,
    start,
    pause,
    reset,
    setDuration,
  } = useTimer(enableSound, enableNotification);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [customH, setCustomH] = useState<number>(Math.floor(targetDurationSec / 3600));
  const [customM, setCustomM] = useState<number>(Math.floor((targetDurationSec % 3600) / 60));
  const [customS, setCustomS] = useState<number>(targetDurationSec % 60);

  const handleApplyCustom = () => {
    const total = (Number(customH) || 0) * 3600 + (Number(customM) || 0) * 60 + (Number(customS) || 0);
    if (total > 0) {
      setDuration(total);
    }
    setIsEditing(false);
  };

  const handlePresetClick = (sec: number) => {
    setDuration(sec);
    setCustomH(Math.floor(sec / 3600));
    setCustomM(Math.floor((sec % 3600) / 60));
    setCustomS(sec % 60);
    setIsEditing(false);
  };

  const statusLabel = {
    idle: 'Ready',
    running: 'Running',
    paused: 'Paused',
    completed: 'Completed',
  }[status];

  return (
    <div className="timer-view">
      {/* Status indicator */}
      <div className={`timer-status-badge ${status}`}>
        <span>{statusLabel}</span>
      </div>

      {/* Main Flip Countdown Display */}
      <div className="flip-clock-display">
        {/* Hours (show if hours > 0 or custom preset had hours) */}
        {(hours > 0 || targetDurationSec >= 3600) && (
          <>
            <FlipUnit
              value={hours}
              label="Hours"
              size={isFullscreen ? 'lg' : 'md'}
              enableSound={enableSound}
            />
            <FlipSeparator />
          </>
        )}

        {/* Minutes */}
        <FlipUnit
          value={minutes}
          label="Minutes"
          size="lg"
          enableSound={enableSound}
        />

        <FlipSeparator />

        {/* Seconds */}
        <FlipUnit
          value={seconds}
          label="Seconds"
          size="lg"
          enableSound={enableSound}
        />
      </div>

      {/* Quick Presets */}
      {status !== 'running' && !isEditing && (
        <div className="timer-presets">
          {PRESETS.map((p) => (
            <button
              key={p.sec}
              className={`preset-chip ${targetDurationSec === p.sec && status === 'idle' ? 'active' : ''}`}
              onClick={() => handlePresetClick(p.sec)}
            >
              {p.label}
            </button>
          ))}
          <button
            className="preset-chip"
            onClick={() => setIsEditing(true)}
            title="Set custom time"
          >
            <Sliders size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Custom
          </button>
        </div>
      )}

      {/* Custom Time Editor */}
      {isEditing && status !== 'running' && (
        <div className="custom-time-editor">
          <div className="custom-time-input-group">
            <input
              type="number"
              className="custom-time-input"
              min={0}
              max={23}
              value={customH}
              onChange={(e) => setCustomH(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
            />
            <span className="custom-time-label">Hr</span>
          </div>
          <span className="custom-time-colon">:</span>
          <div className="custom-time-input-group">
            <input
              type="number"
              className="custom-time-input"
              min={0}
              max={59}
              value={customM}
              onChange={(e) => setCustomM(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            />
            <span className="custom-time-label">Min</span>
          </div>
          <span className="custom-time-colon">:</span>
          <div className="custom-time-input-group">
            <input
              type="number"
              className="custom-time-input"
              min={0}
              max={59}
              value={customS}
              onChange={(e) => setCustomS(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            />
            <span className="custom-time-label">Sec</span>
          </div>

          <button
            className="btn btn-primary"
            style={{ marginLeft: 8, padding: '8px 14px' }}
            onClick={handleApplyCustom}
          >
            <Check size={16} />
            <span>Set</span>
          </button>
        </div>
      )}

      {/* Action Controls */}
      <div className="timer-actions">
        {status === 'running' ? (
          <button className="action-btn action-btn-main" onClick={pause}>
            <Pause size={18} />
            <span>Pause</span>
          </button>
        ) : (
          <button className="action-btn action-btn-main" onClick={start}>
            <Play size={18} />
            <span>{status === 'paused' ? 'Resume' : 'Start'}</span>
          </button>
        )}

        <button
          className="action-btn action-btn-secondary"
          onClick={reset}
          title="Reset timer"
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
