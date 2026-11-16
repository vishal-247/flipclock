import { useState, useEffect, useRef, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { notificationService } from '../services/notificationService';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface PersistedTimerState {
  targetDurationSec: number;
  remainingSec: number;
  status: TimerStatus;
  endTimestamp: number | null;
}

const STORAGE_KEY = 'timer_state';

export function useTimer(enableSound = true, enableNotification = true) {
  const [initialState] = useState<PersistedTimerState>(() => {
    const saved = storageService.get<PersistedTimerState | null>(STORAGE_KEY, null);
    if (saved) {
      if (saved.status === 'running' && saved.endTimestamp) {
        const leftMs = saved.endTimestamp - Date.now();
        if (leftMs <= 0) {
          return {
            targetDurationSec: saved.targetDurationSec,
            remainingSec: 0,
            status: 'completed',
            endTimestamp: null,
          };
        } else {
          return {
            ...saved,
            remainingSec: Math.ceil(leftMs / 1000),
          };
        }
      }
      return saved;
    }
    return {
      targetDurationSec: 300, // 5 min default
      remainingSec: 300,
      status: 'idle',
      endTimestamp: null,
    };
  });

  const [targetDurationSec, setTargetDurationSec] = useState<number>(initialState.targetDurationSec);
  const [remainingSec, setRemainingSec] = useState<number>(initialState.remainingSec);
  const [status, setStatus] = useState<TimerStatus>(initialState.status);
  const endTimestampRef = useRef<number | null>(initialState.endTimestamp);

  // Sync to storage
  const persistState = useCallback((
    curTarget: number,
    curRemaining: number,
    curStatus: TimerStatus,
    curEnd: number | null
  ) => {
    storageService.set<PersistedTimerState>(STORAGE_KEY, {
      targetDurationSec: curTarget,
      remainingSec: curRemaining,
      status: curStatus,
      endTimestamp: curEnd,
    });
  }, []);

  const handleComplete = useCallback(() => {
    setStatus('completed');
    setRemainingSec(0);
    endTimestampRef.current = null;
    persistState(targetDurationSec, 0, 'completed', null);

    if (enableSound) {
      audioService.playAlarm();
    }
    if (enableNotification) {
      notificationService.sendNotification(
        'Timer Complete',
        `Your ${Math.round(targetDurationSec / 60)} minute timer has finished.`
      );
    }
  }, [enableSound, enableNotification, targetDurationSec, persistState]);

  // Main tick loop
  useEffect(() => {
    if (status !== 'running') return;

    const interval = window.setInterval(() => {
      if (!endTimestampRef.current) return;
      const leftMs = endTimestampRef.current - Date.now();
      if (leftMs <= 0) {
        handleComplete();
      } else {
        const nextSec = Math.ceil(leftMs / 1000);
        setRemainingSec(nextSec);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [status, handleComplete]);

  // Background resume handler
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
    const end = Date.now() + remainingSec * 1000;
    endTimestampRef.current = end;
    setStatus('running');
    persistState(targetDurationSec, remainingSec, 'running', end);
  }, [remainingSec, targetDurationSec, persistState]);

  const pause = useCallback(() => {
    if (endTimestampRef.current) {
      const leftMs = Math.max(0, endTimestampRef.current - Date.now());
      const nextRemaining = Math.ceil(leftMs / 1000);
      setRemainingSec(nextRemaining);
      endTimestampRef.current = null;
      setStatus('paused');
      persistState(targetDurationSec, nextRemaining, 'paused', null);
    }
  }, [targetDurationSec, persistState]);

  const reset = useCallback(() => {
    endTimestampRef.current = null;
    setStatus('idle');
    setRemainingSec(targetDurationSec);
    persistState(targetDurationSec, targetDurationSec, 'idle', null);
  }, [targetDurationSec, persistState]);

  const setDuration = useCallback((seconds: number) => {
    endTimestampRef.current = null;
    setStatus('idle');
    setTargetDurationSec(seconds);
    setRemainingSec(seconds);
    persistState(seconds, seconds, 'idle', null);
  }, [persistState]);

  // Derived hours, minutes, seconds
  const hours = Math.floor(remainingSec / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;

  return {
    hours,
    minutes,
    seconds,
    totalRemainingSec: remainingSec,
    targetDurationSec,
    status,
    start,
    pause,
    reset,
    setDuration,
  };
}

