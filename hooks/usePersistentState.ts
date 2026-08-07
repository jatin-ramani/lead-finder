"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state without a mount effect.
 *
 * `useSyncExternalStore` renders `getServerSnapshot` during SSR and hydration,
 * then re-reads the real value on the client — so there is no hydration
 * mismatch and no setState-inside-an-effect cascade.
 */
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or storage disabled — the value just will not persist.
  }
  notify();
}

export function clearStored(keys: string[]) {
  try {
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    return false;
  }
  notify();
  return true;
}

/**
 * @param decode maps the raw stored string (or null) to a value; must be pure
 *               and return a primitive so snapshot equality holds.
 */
export function usePersistentValue<T extends string | number | boolean>(
  key: string,
  serverValue: T,
  decode: (raw: string | null) => T,
): [T, (next: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    useCallback(() => decode(readStored(key)), [key, decode]),
    useCallback(() => serverValue, [serverValue]),
  );

  const setValue = useCallback(
    (next: T) => writeStored(key, String(next)),
    [key],
  );

  return [value, setValue];
}
