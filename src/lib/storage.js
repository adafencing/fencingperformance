import { useEffect, useState } from "react";

/**
 * React hook to sync state with localStorage.
 * @param {string} key - localStorage key
 * @param {any} initialValue - default state if nothing in localStorage
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  }, [key, value]);

  return [value, setValue];
}
