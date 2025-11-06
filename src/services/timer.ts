export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  targetSeconds: number;
  startedAt?: number;
  pausedAt?: number;
  totalPausedDuration: number;
}

export class TimerService {
  private timerId: number | null = null;
  private state: TimerState;
  private listeners: Set<(state: TimerState) => void> = new Set();
  private audioContext: AudioContext | null = null;
  private beepSound: AudioBuffer | null = null;

  constructor(targetSeconds: number = 0) {
    this.state = {
      isRunning: false,
      isPaused: false,
      elapsedSeconds: 0,
      targetSeconds,
      totalPausedDuration: 0,
    };
    this.initAudio();
  }

  private async initAudio() {
    try {
      this.audioContext = new AudioContext();
      // Create a simple beep sound
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.1;
      const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = Math.sin(2 * Math.PI * 440 * (i / sampleRate));
      }
      this.beepSound = buffer;
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }

  private playBeep() {
    if (!this.audioContext || !this.beepSound) return;
    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.beepSound;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Failed to play beep:', error);
    }
  }

  private vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }

  subscribe(listener: (state: TimerState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
    // Persist state
    this.persistState();
  }

  private persistState() {
    const key = 'kule_timer_state';
    try {
      localStorage.setItem(key, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to persist timer state:', error);
    }
  }

  restoreState() {
    const key = 'kule_timer_state';
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = { ...this.state, ...parsed };
        this.notify();
      }
    } catch (error) {
      console.warn('Failed to restore timer state:', error);
    }
  }

  setTarget(seconds: number) {
    this.state.targetSeconds = seconds;
    this.notify();
  }

  start() {
    if (this.state.isRunning) return;

    const now = Date.now();
    if (this.state.isPaused && this.state.pausedAt) {
      // Resume
      this.state.totalPausedDuration += now - this.state.pausedAt;
      this.state.pausedAt = undefined;
      this.state.isPaused = false;
    } else {
      // Fresh start
      this.state.startedAt = now;
      this.state.totalPausedDuration = 0;
      this.state.elapsedSeconds = 0;
    }

    this.state.isRunning = true;
    this.timerId = window.setInterval(() => {
      if (!this.state.startedAt) return;
      const now = Date.now();
      const elapsed = (now - this.state.startedAt - this.state.totalPausedDuration) / 1000;
      this.state.elapsedSeconds = Math.floor(elapsed);

      if (this.state.targetSeconds > 0 && this.state.elapsedSeconds >= this.state.targetSeconds) {
        this.complete();
      } else {
        this.notify();
      }
    }, 100);
    this.notify();
  }

  pause() {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.state.isPaused = true;
    this.state.pausedAt = Date.now();
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.state.isRunning = false;
    this.notify();
  }

  resume() {
    if (!this.state.isPaused) return;
    this.start();
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.elapsedSeconds = 0;
    this.state.startedAt = undefined;
    this.state.pausedAt = undefined;
    this.state.totalPausedDuration = 0;
    this.notify();
  }

  skip() {
    this.stop();
    this.playBeep();
    this.vibrate();
  }

  private complete() {
    this.stop();
    this.playBeep();
    this.vibrate();
    this.notify();
  }

  getState(): TimerState {
    return { ...this.state };
  }

  getRemainingSeconds(): number {
    return Math.max(0, this.state.targetSeconds - this.state.elapsedSeconds);
  }

  getProgress(): number {
    if (this.state.targetSeconds === 0) return 0;
    return Math.min(1, this.state.elapsedSeconds / this.state.targetSeconds);
  }
}

