import React from 'react';
import { usePomodoro } from '../../hooks/usePomodoro';
import { FlipUnit } from '../../components/flip/FlipUnit';
import { FlipSeparator } from '../../components/flip/FlipSeparator';
import { PomodoroConfig } from '../../settings/types';
import { Play, Pause, RotateCcw, SkipForward, Flame, Coffee, Sparkles } from 'lucide-react';
import '../../styles/pomodoro.css';

interface PomodoroTimerProps {
  config: PomodoroConfig;
  enableSound: boolean;
  enableNotification: boolean;
  onOpenSettings: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  config,
  enableSound,
  enableNotification,
}) => {
  const {
    mode,
    status,
    minutes,
    seconds,
    completedSessions,
    currentCycle,
    maxCycles,
    start,
    pause,
    reset,
    skip,
    switchMode,
  } = usePomodoro(config, enableSound, enableNotification);

  const modeIcons = {
    focus: <Flame size={16} />,
    shortBreak: <Coffee size={16} />,
    longBreak: <Sparkles size={16} />,
  };

  const getMainBtnClass = () => {
    if (mode === 'focus') return 'pomodoro-btn-focus';
    if (mode === 'shortBreak') return 'pomodoro-btn-break';
    return 'pomodoro-btn-long-break';
  };

  return (
    <div className="pomodoro-view">
      {/* Mode Selector */}
      <div className="pomodoro-mode-selector">
        <button
          className={`pomodoro-mode-btn ${mode === 'focus' ? 'active mode-focus' : ''}`}
          onClick={() => switchMode('focus')}
        >
          {modeIcons.focus}
          <span style={{ marginLeft: 6 }}>Focus</span>
        </button>

        <button
          className={`pomodoro-mode-btn ${mode === 'shortBreak' ? 'active mode-shortBreak' : ''}`}
          onClick={() => switchMode('shortBreak')}
        >
          {modeIcons.shortBreak}
          <span style={{ marginLeft: 6 }}>Short Break</span>
        </button>

        <button
          className={`pomodoro-mode-btn ${mode === 'longBreak' ? 'active mode-longBreak' : ''}`}
          onClick={() => switchMode('longBreak')}
        >
          {modeIcons.longBreak}
          <span style={{ marginLeft: 6 }}>Long Break</span>
        </button>
      </div>

      {/* Main Flip Card Display */}
      <div className="flip-clock-display">
        <FlipUnit
          value={minutes}
          label="Minutes"
          size="lg"
          enableSound={enableSound}
        />

        <FlipSeparator />

        <FlipUnit
          value={seconds}
          label="Seconds"
          size="lg"
          enableSound={enableSound}
        />
      </div>

      {/* Cycle Indicator & Counter */}
      <div className="pomodoro-cycle-indicator">
        <div className="cycle-dots">
          {Array.from({ length: maxCycles }).map((_, idx) => {
            const isCompleted = idx < (completedSessions % maxCycles);
            const isCurrent = idx === (currentCycle - 1) && mode === 'focus';
            return (
              <div
                key={idx}
                className={`cycle-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                title={`Interval ${idx + 1}`}
              />
            );
          })}
        </div>
        <span className="pomodoro-stat-text">
          Session #{completedSessions + 1} ({completedSessions} completed today)
        </span>
      </div>

      {/* Action Controls */}
      <div className="pomodoro-actions">
        {status === 'running' ? (
          <button className={`action-btn action-btn-main ${getMainBtnClass()}`} onClick={pause}>
            <Pause size={18} />
            <span>Pause</span>
          </button>
        ) : (
          <button className={`action-btn action-btn-main ${getMainBtnClass()}`} onClick={start}>
            <Play size={18} />
            <span>{status === 'paused' ? 'Resume' : 'Start'}</span>
          </button>
        )}

        <button
          className="action-btn action-btn-secondary"
          onClick={skip}
          title="Skip to next session"
        >
          <SkipForward size={18} />
          <span>Skip</span>
        </button>

        <button
          className="action-btn action-btn-secondary"
          onClick={reset}
          title="Reset current session"
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
