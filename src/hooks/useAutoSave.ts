import { useEffect, useRef } from 'react';
import { useLoanStore } from '../store/loanStore';

export function useAutoSave(intervalMs = 30000) {
  const { hasUnsavedChanges, setLastSaved } = useLoanStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (hasUnsavedChanges) {
        setLastSaved(new Date().toISOString());
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasUnsavedChanges, setLastSaved, intervalMs]);

  const saveNow = () => {
    setLastSaved(new Date().toISOString());
  };

  return { saveNow };
}
