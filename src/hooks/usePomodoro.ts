import { useState, useEffect, useRef, useCallback } from 'react';
import { PomodoroConfig } from '../settings/types';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { notificationService } from '../services/notificationService';

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';
export type PomodoroStatus = 'idle' | 'running' | 'paused';

interface PersistedPomodoroState {
  mode: PomodoroMode;
  status: PomodoroStatus;
  remainingSec: number;
  completedSessions: number;
  endTimestamp: number | null;
}

const STORAGE_KEY = 'pomodoro_state';

export function usePomodoro(
  config: PomodoroConfig,
  enableSound = true,
  enableNotification = true
) {
  const getModeDurationSec = useCallback(
    (mode: PomodoroMode): number => {
      switch (mode) {
        case 'focus':
          return config.focusDuration * 60;
        case 'shortBreak':
          return config.shortBreakDuration * 60;
        case 'longBreak':
          return config.longBreakDuration * 60;
      }
    },
    [config.focusDuration, config.shortBreakDuration, config.longBreakDuration]
  );

  const [initialState] = useState<PersistedPomodoroState>(() => {
    const saved = storageService.get<PersistedPomodoroState | null>(STORAGE_KEY, null);
    if (saved) {
      if (saved.status === 'running' && saved.endTimestamp) {
        const leftMs = saved.endTimestamp - Date.now();
        if (leftMs <= 0) {
          return {
            ...saved,
            status: 'idle',
            remainingSec: 0,
            endTimestamp: null,
          };
        }
        return {
          ...saved,
          remainingSec: Math.ceil(leftMs / 1000),
        };
      }
      return saved;
    }
    return {
      mode: 'focus',
      status: 'idle',
      remainingSec: 25 * 60,
      completedSessions: 0,
      endTimestamp: null,
    };
  });

  const [mode, setMode] = useState<PomodoroMode>(initialState.mode);
  const [status, setStatus] = useState<PomodoroStatus>(initialState.status);
  const [remainingSec, setRemainingSec] = useState<number>(initialState.remainingSec);
  const [completedSessions, setCompletedSessions] = useState<number>(initialState.completedSessions);
  const endTimestampRef = useRef<number | null>(initialState.endTimestamp);

  const persistState = useCallback(
    (
      curMode: PomodoroMode,
      curStatus: PomodoroStatus,
      curRemaining: number,
      curCompleted: number,
      curEnd: number | null
    ) => {
      storageService.set<PersistedPomodoroState>(STORAGE_KEY, {
        mode: curMode,
        status: curStatus,
        remainingSec: curRemaining,
        completedSessions: curCompleted,
        endTimestamp: curEnd,
      });
    },
    []
  );

  // Transition to next session
  const transitionToNext = useCallback(
    (completedSessionNow: boolean = false) => {
      let nextMode: PomodoroMode = 'focus';
      let nextCompleted = completedSessions;

      if (mode === 'focus') {
        nextCompleted = completedSessions + (completedSessionNow ? 1 : 0);
        setCompletedSessions(nextCompleted);

        // Check if it's time for long break
        const isLongBreak =
          nextCompleted > 0 && nextCompleted % config.longBreakInterval === 0;
        nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
      } else {
        nextMode = 'focus';
      }

      const nextDuration = getModeDurationSec(nextMode);
      setMode(nextMode);
      setRemainingSec(nextDuration);

      const shouldAutoStart =
        (nextMode === 'focus' && config.autoStartFocus) ||
        (nextMode !== 'focus' && config.autoStartBreaks);

      if (shouldAutoStart) {
        const nextEnd = Date.now() + nextDuration * 1000;
        endTimestampRef.current = nextEnd;
        setStatus('running');
        persistState(nextMode, 'running', nextDuration, nextCompleted, nextEnd);
      } else {
        endTimestampRef.current = null;
        setStatus('idle');
        persistState(nextMode, 'idle', nextDuration, nextCompleted, null);
      }
    },
    [
      mode,
      completedSessions,
      config.longBreakInterval,
      config.autoStartFocus,
      config.autoStartBreaks,
      getModeDurationSec,
      persistState,
    ]
  );

  const handleComplete = useCallback(() => {
    endTimestampRef.current = null;

    if (mode === 'focus') {
      if (enableSound) audioService.playAlarm();
      if (enableNotification) {
        notificationService.sendNotification(
          'Focus Session Finished',
          'Great job! Take a well-deserved break.'
        );
      }
      transitionToNext(true);
    } else {
      if (enableSound) audioService.playTransition();
      if (enableNotification) {
        notificationService.sendNotification(
          'Break Finished',
          'Break is over. Ready to focus again?'
        );
      }
      transitionToNext(false);
    }
  }, [
    mode,
    enableSound,
    enableNotification,
    transitionToNext,
  ]);

  // Tick loop
  useEffect(() => {
    if (status !== 'running') return;

    const interval = window.setInterval(() => {
      if (!endTimestampRef.current) return;
      const leftMs = endTimestampRef.current - Date.now();
      if (leftMs <= 0) {
        handleComplete();
      } else {
        setRemainingSec(Math.ceil(leftMs / 1000));
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [status, handleComplete]);

  // Resume from background/sleep
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'running' && endTimestampRef.current) {
        const leftMs = endTimestampRef.current - Date.now();
        if (leftMs <= 0) {
          handleComplete();
        } else {
          setRemainingSec(Math.ceil(leftMs / 1000));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status, handleComplete]);

  const start = useCallback(() => {
    const duration = remainingSec > 0 ? remainingSec : getModeDurationSec(mode);
    const end = Date.now() + duration * 1000;
    endTimestampRef.current = end;
    setRemainingSec(duration);
    setStatus('running');
    persistState(mode, 'running', duration, completedSessions, end);
  }, [remainingSec, getModeDurationSec, mode, completedSessions, persistState]);

  const pause = useCallback(() => {
    if (endTimestampRef.current) {
      const leftMs = Math.max(0, endTimestampRef.current - Date.now());
      const leftSec = Math.ceil(leftMs / 1000);
      endTimestampRef.current = null;
      setRemainingSec(leftSec);
      setStatus('paused');
      persistState(mode, 'paused', leftSec, completedSessions, null);
    }
  }, [mode, completedSessions, persistState]);

  const reset = useCallback(() => {
    endTimestampRef.current = null;
    const duration = getModeDurationSec(mode);
    setRemainingSec(duration);
    setStatus('idle');
    persistState(mode, 'idle', duration, completedSessions, null);
  }, [getModeDurationSec, mode, completedSessions, persistState]);

  const switchMode = useCallback(
    (newMode: PomodoroMode) => {
      endTimestampRef.current = null;
      const duration = getModeDurationSec(newMode);
      setMode(newMode);
      setRemainingSec(duration);
      setStatus('idle');
      persistState(newMode, 'idle', duration, completedSessions, null);
    },
    [getModeDurationSec, completedSessions, persistState]
  );

  const skip = useCallback(() => {
    transitionToNext(false);
  }, [transitionToNext]);

  const resetAllSessions = useCallback(() => {
    endTimestampRef.current = null;
    const duration = getModeDurationSec('focus');
    setMode('focus');
    setRemainingSec(duration);
    setStatus('idle');
    setCompletedSessions(0);
    persistState('focus', 'idle', duration, 0, null);
  }, [getModeDurationSec, persistState]);

  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const currentCycle = (completedSessions % config.longBreakInterval) + 1;

  return {
    mode,
    status,
    minutes,
    seconds,
    remainingSec,
    completedSessions,
    currentCycle,
    maxCycles: config.longBreakInterval,
    start,
    pause,
    reset,
    skip,
    switchMode,
    resetAllSessions,
  };
}
