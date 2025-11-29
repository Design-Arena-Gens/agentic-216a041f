"use client";

import { useEffect, useState } from "react";

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
): readonly [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored) as T;
        setValue(parsed);
      }
    } catch (error) {
      console.warn(`Failed to restore key "${key}" from localStorage.`, error);
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to persist key "${key}" to localStorage.`, error);
    }
  }, [hydrated, key, value]);

  const setAndPersist = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = next instanceof Function ? next(prev) : next;

      return resolved;
    });
  };

  return [value, setAndPersist, hydrated] as const;
}
