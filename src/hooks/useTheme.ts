import { useState, useEffect, useCallback } from 'react';
import { AppTheme } from '../settings/types';
import { storageService } from '../services/storageService';

const THEME_KEY = 'app_theme';

export function useTheme() {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return storageService.get<AppTheme>(THEME_KEY, 'dark');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storageService.set(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
  }, []);

  return { theme, toggleTheme, setTheme };
}
