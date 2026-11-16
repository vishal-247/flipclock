export type AppTheme = 'dark' | 'light';

export type ClockFormat = '12h' | '24h';

export interface PomodoroConfig {
  focusDuration: number;       // in minutes (default 25)
  shortBreakDuration: number;  // in minutes (default 5)
  longBreakDuration: number;   // in minutes (default 15)
  longBreakInterval: number;   // sessions before long break (default 4)
  autoStartBreaks: boolean;    // auto transition to break
  autoStartFocus: boolean;     // auto transition to focus
}

export interface AppSettings {
  theme: AppTheme;
  clockFormat: ClockFormat;
  showSeconds: boolean;
  flipSound: boolean;
  notificationsEnabled: boolean;
  pomodoro: PomodoroConfig;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  clockFormat: '12h',
  showSeconds: true,
  flipSound: true,
  notificationsEnabled: true,
  pomodoro: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
  },
};
