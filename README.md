# My Clock

A minimal, lightweight, cross-platform personal productivity application for **Windows** and **Android**, built with **React**, **TypeScript**, **Vite**, and **Tauri 2**.

---

## Features

### 1. 🕰️ Flip Clock
- **Realistic Split-Flap 3D Physics:** Multi-stage 3D card folding and unfolding with dynamic shadow overlays, central horizontal divider seam, and mechanical hinge pins.
- **Synthesized Split-Flap Audio:** Zero-latency mechanical flap sounds synthesized in real-time via the Web Audio API without requiring any external audio files.
- **Accurate Timekeeping:** Aligned to next-second boundaries and resynced upon window focus/visibility changes.
- **12h / 24h Formats:** Instant format switching with dedicated AM/PM indicators.
- **Date & Day Badge:** Displays current day of the week and date.
- **Fullscreen Mode:** Distraction-free fullscreen view with keyboard shortcuts (`F` or `F11`, `ESC` to exit) and hover controls.

### 2. ⏳ Countdown Timer
- **Split-Flap Display:** Live countdown presented on flip cards.
- **Quick Presets:** Instant 1m, 5m, 10m, 15m, and 30m shortcuts.
- **Custom Durations:** Interactive hours, minutes, and seconds picker.
- **Controls:** Start, pause, resume, and reset.
- **Background Accuracy:** Timestamp-based countdown calculations (`Date.now()`) ensuring accuracy even when minimized or suspended.
- **Alerts:** Completion chimes and native system notifications.

### 3. 🍅 Pomodoro Timer
- **Structured Sessions:** Focus Session (25 min default), Short Break (5 min default), and Long Break (15 min default).
- **Session Progress:** Visual cycle dots tracking sessions before the next long break, plus a completed session counter.
- **Controls:** Start, pause, resume, and skip session.
- **Auto Transitions:** Optional automatic transitions to breaks or focus sessions.
- **Customizable Intervals:** Configurable durations in Settings.

### 4. 🎨 Themes & UI
- **Dark Theme (Default):** Deep charcoal flip cards on an authentic black background.
- **Light Theme:** High-contrast luxury flip clock styling.
- **Local Persistence:** All states, settings, and themes are persisted across app restarts.
- **Responsive Layout:** Adaptive scaling for mobile screens and desktop monitors.

---

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Desktop & Mobile Runtime:** Tauri 2
- **Icons:** Lucide React
- **Animations:** CSS 3D Transforms (`rotateX`, `perspective`, `transform-origin`)
- **Sound:** Synthesized Web Audio API (offline, zero-latency)
- **Notifications:** Tauri Plugin Notification with standard Web Notification fallback

---

## Project Structure

```
flipclock/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── App.tsx             # Main orchestrator & layout
│   │   ├── AppHeader.tsx       # Top bar with theme, settings, fullscreen
│   │   └── AppNavigation.tsx   # 3-tab navigation (Clock, Timer, Pomodoro)
│   ├── components/
│   │   └── flip/
│   │       ├── FlipCard.tsx    # 3D split flap card with top/bottom leaves
│   │       ├── FlipUnit.tsx    # Paired 2-digit unit (e.g. HH, MM, SS)
│   │       └── FlipSeparator.tsx # Colon indicator dots
│   ├── features/
│   │   ├── clock/
│   │   │   └── FlipClock.tsx   # Flip Clock view & controls
│   │   ├── timer/
│   │   │   └── CountdownTimer.tsx # Timer view, presets & custom input
│   │   └── pomodoro/
│   │       └── PomodoroTimer.tsx  # Pomodoro view, cycle indicator & actions
│   ├── hooks/
│   │   ├── useClock.ts         # Clock drift compensation & format logic
│   │   ├── useTimer.ts         # Timestamp-based countdown & background sync
│   │   ├── usePomodoro.ts      # Pomodoro cycle state machine
│   │   ├── useTheme.ts         # Dark/Light theme management
│   │   └── useFullscreen.ts    # Cross-platform fullscreen handler
│   ├── services/
│   │   ├── audioService.ts     # Synthesized mechanical flip & chime sounds
│   │   ├── notificationService.ts # Tauri 2 & Web Notification bridge
│   │   └── storageService.ts   # Safe typed localStorage persistence
│   ├── settings/
│   │   ├── SettingsModal.tsx   # Configuration modal
│   │   └── types.ts            # Type definitions & defaults
│   └── styles/
│       ├── variables.css       # CSS design tokens & themes
│       ├── global.css          # Base typography & layout
│       ├── flipcard.css        # 3D transform keyframes & flap mechanics
│       ├── clock.css           # Clock styling
│       ├── timer.css           # Timer styling
│       └── pomodoro.css        # Pomodoro styling
└── src-tauri/
    ├── Cargo.toml              # Tauri 2 dependencies & plugins
    ├── tauri.conf.json         # Window configuration & permissions
    ├── capabilities/
    │   └── default.json        # Tauri 2 security capabilities
    ├── build.rs
    └── src/
        ├── lib.rs              # Mobile & desktop entry point
        └── main.rs             # Windows subsystem bootstrap
```

---

## Getting Started

### 1. Web Development Server
To run the web version locally in your browser:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Build Web Assets
```bash
npm run build
```

### 3. Desktop Application (Windows)
When you have Rust installed on your machine:
```bash
npm run tauri dev
```
To build a production `.exe` / `.msi`:
```bash
npm run tauri build
```

### 4. Android Build
With Android Studio and the Android NDK configured:
```bash
npm run tauri android init
npm run tauri android dev
```
To generate the release APK/AAB:
```bash
npm run tauri android build
```

