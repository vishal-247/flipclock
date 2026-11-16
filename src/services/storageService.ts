/**
 * Storage Service
 * Handles persistence for app state, theme, timer, pomodoro and settings.
 */

export const storageService = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(`myclock_${key}`);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`myclock_${key}`, JSON.stringify(value));
    } catch {
      // Storage full or private mode quota reached
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`myclock_${key}`);
    } catch {
      // Ignore
    }
  },
};
