import { useRef, useCallback, useEffect } from 'react';

/**
 * useAutoSave — debounced auto-save for editor components.
 * 
 * Usage:
 *   const triggerSave = useAutoSave(async () => {
 *     await onUpdate({ field1: val1, field2: val2 });
 *   }, 1500);
 * 
 *   // Call triggerSave() whenever a field changes
 *   <Input onChange={(e) => { setVal(e.target.value); triggerSave(); }} />
 */
export function useAutoSave(saveFn: () => Promise<any>, delayMs = 1500) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const saveFnRef = useRef(saveFn);
  
  // Always use latest save function without resetting timer
  saveFnRef.current = saveFn;

  const trigger = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await saveFnRef.current();
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }, delayMs);
  }, [delayMs]);

  // Cleanup on unmount — save immediately if pending
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        // Fire final save synchronously-ish
        saveFnRef.current().catch(() => {});
      }
    };
  }, []);

  return trigger;
}
