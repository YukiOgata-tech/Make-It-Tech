"use client";

import { useState, useEffect, useCallback } from "react";

export interface TextHistoryItem {
  id: string;
  content: string;
  preview: string; // Truncated preview
  metadata: Record<string, string | number>;
  timestamp: number;
  expiresAt: number;
}

interface HistoryState {
  items: TextHistoryItem[];
  version: string;
}

const HISTORY_VERSION = "1.0";
const EXPIRATION_HOURS = 24;
const MAX_ITEMS = 20;
const PREVIEW_LENGTH = 50;

export function useTextHistory(storageKey: string, enabled: boolean = true) {
  const [items, setItems] = useState<TextHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fullKey = `devtools_${storageKey}_history`;

  useEffect(() => {
    if (!enabled) {
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) {
        const state: HistoryState = JSON.parse(stored);
        if (state.version === HISTORY_VERSION) {
          const now = Date.now();
          const validItems = state.items.filter((item) => item.expiresAt > now);
          setItems(validItems);

          if (validItems.length !== state.items.length) {
            saveToStorage(validItems);
          }
        }
      }
    } catch {
      // Invalid data
    }
    setIsLoaded(true);
  }, [enabled, fullKey]);

  const saveToStorage = useCallback((newItems: TextHistoryItem[]) => {
    const state: HistoryState = {
      items: newItems,
      version: HISTORY_VERSION,
    };
    localStorage.setItem(fullKey, JSON.stringify(state));
  }, [fullKey]);

  const addItem = useCallback(
    (content: string, metadata: Record<string, string | number> = {}): void => {
      if (!enabled || !content.trim()) return;

      // Don't add duplicate content
      const exists = items.some((item) => item.content === content);
      if (exists) return;

      const now = Date.now();
      const preview = content.slice(0, PREVIEW_LENGTH) + (content.length > PREVIEW_LENGTH ? "..." : "");

      const newItem: TextHistoryItem = {
        id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
        content,
        preview,
        metadata,
        timestamp: now,
        expiresAt: now + EXPIRATION_HOURS * 60 * 60 * 1000,
      };

      setItems((prev) => {
        const updated = [newItem, ...prev].slice(0, MAX_ITEMS);
        saveToStorage(updated);
        return updated;
      });
    },
    [enabled, items, saveToStorage]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  const clearHistory = useCallback(() => {
    setItems([]);
    localStorage.removeItem(fullKey);
  }, [fullKey]);

  const getTimeRemaining = useCallback((expiresAt: number): string => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return "期限切れ";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}時間${minutes}分`;
    return `${minutes}分`;
  }, []);

  const formatTimestamp = useCallback((timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return new Date(timestamp).toLocaleDateString("ja-JP");
  }, []);

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    clearHistory,
    getTimeRemaining,
    formatTimestamp,
  };
}
