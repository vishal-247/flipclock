import React from 'react';
import { AppSettings, PomodoroConfig } from './types';
import { X, Bell, Volume2, Moon, Sun, Clock, Sparkles } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handlePomodoroChange = (key: keyof PomodoroConfig, val: number | boolean) => {
    onUpdateSettings({
      pomodoro: {
        ...settings.pomodoro,
        [key]: val,
      },
    });
  };

  const handleRequestNotification = async () => {
    const granted = await notificationService.requestPermission();
    onUpdateSettings({ notificationsEnabled: granted });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <h3 className="modal-title">Settings</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Appearance Section */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Appearance & Clock
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Theme toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>Theme</span>
                </div>
                <button
                  className="preset-chip"
                  onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                >
                  {settings.theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>

              {/* Format toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={18} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>Time Format</span>
                </div>
                <button
                  className="preset-chip"
                  onClick={() => onUpdateSettings({ clockFormat: settings.clockFormat === '12h' ? '24h' : '12h' })}
                >
                  {settings.clockFormat === '12h' ? '12-Hour (AM/PM)' : '24-Hour'}
                </button>
              </div>

              {/* Sound */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Volume2 size={18} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>Sound Effects</span>
                </div>
                <input
                  type="checkbox"
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                  checked={settings.flipSound}
                  onChange={(e) => onUpdateSettings({ flipSound: e.target.checked })}
                />
              </div>

              {/* Notifications */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bell size={18} />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 500 }}>Notifications</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Timer & Pomodoro alerts</div>
                  </div>
                </div>
                <button
                  className={`preset-chip ${settings.notificationsEnabled ? 'active' : ''}`}
                  onClick={handleRequestNotification}
                >
                  {settings.notificationsEnabled ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>
          </div>

          {/* Pomodoro Configuration Section */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Pomodoro Intervals (Minutes)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Focus</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  className="custom-time-input"
                  style={{ width: '100%' }}
                  value={settings.pomodoro.focusDuration}
                  onChange={(e) => handlePomodoroChange('focusDuration', Math.max(1, parseInt(e.target.value) || 25))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Short Break</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="custom-time-input"
                  style={{ width: '100%' }}
                  value={settings.pomodoro.shortBreakDuration}
                  onChange={(e) => handlePomodoroChange('shortBreakDuration', Math.max(1, parseInt(e.target.value) || 5))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Long Break</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  className="custom-time-input"
                  style={{ width: '100%' }}
                  value={settings.pomodoro.longBreakDuration}
                  onChange={(e) => handlePomodoroChange('longBreakDuration', Math.max(1, parseInt(e.target.value) || 15))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem' }}>Long Break Interval</span>
                <input
                  type="number"
                  min={2}
                  max={8}
                  className="custom-time-input"
                  style={{ width: 60 }}
                  value={settings.pomodoro.longBreakInterval}
                  onChange={(e) => handlePomodoroChange('longBreakInterval', Math.max(1, parseInt(e.target.value) || 4))}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem' }}>Auto-start Breaks</span>
                <input
                  type="checkbox"
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                  checked={settings.pomodoro.autoStartBreaks}
                  onChange={(e) => handlePomodoroChange('autoStartBreaks', e.target.checked)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem' }}>Auto-start Focus</span>
                <input
                  type="checkbox"
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                  checked={settings.pomodoro.autoStartFocus}
                  onChange={(e) => handlePomodoroChange('autoStartFocus', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
