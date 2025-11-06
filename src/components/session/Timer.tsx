import { useState, useEffect, useRef } from 'react';
import { TimerService } from '@/services/timer';
import Button from '@/components/common/Button';

interface TimerProps {
  restSeconds: number;
}

export default function Timer({ restSeconds }: TimerProps) {
  const timerRef = useRef<TimerService | null>(null);
  const [state, setState] = useState<ReturnType<TimerService['getState']> | null>(null);

  useEffect(() => {
    // Create timer instance once
    if (!timerRef.current) {
      timerRef.current = new TimerService(restSeconds);
      const initialState = timerRef.current.getState();
      setState(initialState);
    }

    const timer = timerRef.current;
    
    // Update target when restSeconds changes
    timer.setTarget(restSeconds);
    
    // Subscribe to timer updates
    const unsubscribe = timer.subscribe(setState);
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      timer.stop();
    };
  }, [restSeconds]);

  // Update state from timer
  useEffect(() => {
    if (!timerRef.current) return;
    
    const interval = setInterval(() => {
      if (timerRef.current) {
        setState(timerRef.current.getState());
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  if (!timerRef.current || !state) return null;

  const remaining = timerRef.current.getRemainingSeconds();
  const progress = timerRef.current.getProgress();
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Rest Timer</h3>
        <div className="text-2xl font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-4">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex gap-2">
        {state.isRunning ? (
          <Button variant="outline" size="sm" onClick={() => timerRef.current?.pause()}>
            Pause
          </Button>
        ) : state.isPaused ? (
          <Button variant="primary" size="sm" onClick={() => timerRef.current?.resume()}>
            Resume
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={() => timerRef.current?.start()}>
            Start
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => timerRef.current?.skip()}>
          Skip
        </Button>
        <Button variant="outline" size="sm" onClick={() => timerRef.current?.stop()}>
          Reset
        </Button>
      </div>
    </div>
  );
}

