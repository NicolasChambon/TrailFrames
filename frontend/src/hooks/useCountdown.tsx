import { useEffect, useRef, useState } from "react";

/**
 * Hook to manage a countdown timer with auto-redirect
 * @param initialSeconds - Starting countdown value
 * @param onComplete - Callback when countdown reaches 0
 * @param shouldStart - Whether to start the countdown
 * @returns Current seconds left
 */
export function useCountdown(
  initialSeconds: number,
  onComplete: () => void,
  shouldStart: boolean = true
) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep the latest callback in ref to avoid recreating the effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!shouldStart) {
      return;
    }

    // Reset countdown
    setSecondsLeft(initialSeconds);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start countdown
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [initialSeconds, shouldStart]);

  return secondsLeft;
}
