'use client';

import { useSyncExternalStore } from 'react';

// User settings, stored in the browser so they are kept when revisiting the site

const autoGuessKey: string = 'geodle.autoGuess';
const listeners: Set<() => void> = new Set();
// Used when storage is unavailable (e.g. blocked site data), so the setting still works until the page is reloaded
let autoGuessInMemory: boolean = true;

function getAutoGuess(): boolean {
  try {
    return localStorage.getItem(autoGuessKey) !== 'false';
  } catch {
    return autoGuessInMemory;
  }
}

function setAutoGuess(autoGuess: boolean) {
  autoGuessInMemory = autoGuess;
  try {
    localStorage.setItem(autoGuessKey, String(autoGuess));
  } catch {
    // The in-memory value is used instead
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Keep other tabs in sync
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * Whether answers are submitted automatically while typing, once they match.
 * When disabled, answers are only submitted by pressing Enter. Enabled by default
 */
export function useAutoGuess(): [boolean, (autoGuess: boolean) => void] {
  // The server has no storage, so it renders the default
  const autoGuess: boolean = useSyncExternalStore(
    subscribe,
    getAutoGuess,
    () => true
  );
  return [autoGuess, setAutoGuess];
}
