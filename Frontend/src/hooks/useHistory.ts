import { useState, useEffect } from 'react';
import type { HistoryEntry } from '../types';

const STORAGE_KEY = 'parsify_history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  function addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [newEntry, ...prev]);
    return newEntry;
  }

  function clearHistory() {
    setHistory([]);
  }

  function removeEntry(id: string) {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }

  return { history, addEntry, clearHistory, removeEntry };
}
