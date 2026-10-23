import { useState, useCallback, useEffect } from 'react';
import { ConfiguratorState } from '../types/configurator';

export function useHistoryState(initialPresent: ConfiguratorState) {
  const [past, setPast] = useState<ConfiguratorState[]>([]);
  const [present, setPresent] = useState<ConfiguratorState>(initialPresent);
  const [future, setFuture] = useState<ConfiguratorState[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
  }, [canUndo, past, present, future]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [canRedo, past, present, future]);

  const set = useCallback(
    (newPresent: ConfiguratorState | ((curr: ConfiguratorState) => ConfiguratorState)) => {
      setPresent((curr) => {
        const nextState = typeof newPresent === 'function' ? newPresent(curr) : newPresent;
        if (JSON.stringify(curr) === JSON.stringify(nextState)) {
          return curr;
        }
        setPast((p) => [...p.slice(-25), curr]); // Keep last 25 states
        setFuture([]);
        return nextState;
      });
    },
    []
  );

  // Global hotkeys (Ctrl+Z / Ctrl+Y / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return { state: present, setState: set, undo, redo, canUndo, canRedo };
}
