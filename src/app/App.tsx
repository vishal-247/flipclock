import React, { useState, useEffect } from 'react';
import { AppNavigation, ActiveTab } from './AppNavigation';
import { FlipClock } from '../features/clock/FlipClock';
import { CountdownTimer } from '../features/timer/CountdownTimer';
import { PomodoroTimer } from '../features/pomodoro/PomodoroTimer';
import { SettingsModal } from '../settings/SettingsModal';
import { AppSettings, DEFAULT_SETTINGS } from '../settings/types';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { useFullscreen } from '../hooks/useFullscreen';
import '../styles/global.css';

const SETTINGS_KEY = 'settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'timer' || tab === 'pomodoro' || tab === 'clock') return tab;
    }
    return 'clock';
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    return storageService.get<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('settings') === 'true';
    }
    return false;
  });
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    audioService.setMuted(!settings.flipSound);
    storageService.set(SETTINGS_KEY, settings);
  }, [settings]);

  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleToggleTheme = () => {
    handleUpdateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  const handleToggleSeconds = () => {
    handleUpdateSettings({
      showSeconds: !settings.showSeconds,
    });
  };

  const handleToggleSound = () => {
    handleUpdateSettings({
      flipSound: !settings.flipSound,
    });
  };

  return (
    <div className={`app-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <AppNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="app-main">
        {activeTab === 'clock' && (
          <FlipClock
            format={settings.clockFormat}
            showSeconds={settings.showSeconds}
            enableSound={settings.flipSound}
            isFullscreen={isFullscreen}
            theme={settings.theme}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleSeconds={handleToggleSeconds}
            onToggleSound={handleToggleSound}
            onToggleFullscreen={toggleFullscreen}
          />
        )}

        {activeTab === 'timer' && (
          <CountdownTimer
            enableSound={settings.flipSound}
            enableNotification={settings.notificationsEnabled}
            isFullscreen={isFullscreen}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroTimer
            config={settings.pomodoro}
            enableSound={settings.flipSound}
            enableNotification={settings.notificationsEnabled}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};

export default App;
