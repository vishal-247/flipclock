/**
 * Cross-platform Notification Service
 * Gracefully integrates Tauri 2 native notifications on Windows/Android,
 * with standard Web Notification API fallback in the browser.
 */

class NotificationService {
  private hasTauri(): boolean {
    return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // 1. Try Tauri Plugin Notification
    if (this.hasTauri()) {
      try {
        const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
        let granted = await isPermissionGranted();
        if (!granted) {
          const permission = await requestPermission();
          granted = permission === 'granted';
        }
        return granted;
      } catch {
        // Fall back to web
      }
    }

    // 2. Browser Web Notification API
    if ('Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          return true;
        }
        if (Notification.permission !== 'denied') {
          const res = await Notification.requestPermission();
          return res === 'granted';
        }
      } catch {
        return false;
      }
    }

    return false;
  }

  public async sendNotification(title: string, body: string): Promise<void> {
    if (typeof window === 'undefined') return;

    // 1. Try Tauri Plugin Notification
    if (this.hasTauri()) {
      try {
        const { sendNotification, isPermissionGranted } = await import('@tauri-apps/plugin-notification');
        const granted = await isPermissionGranted();
        if (granted) {
          sendNotification({ title, body });
          return;
        }
      } catch {
        // Fall back to web
      }
    }

    // 2. Web Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/clock-icon.svg',
          badge: '/clock-icon.svg',
        });
      } catch {
        // Some mobile browsers restrict Notification constructor without service worker
      }
    }
  }
}

export const notificationService = new NotificationService();
