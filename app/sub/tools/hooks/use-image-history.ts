"use client";

import { useState, useEffect, useCallback } from "react";

export interface ImageHistoryItem {
  id: string;
  originalName: string;
  originalSize: number;
  processedSize: number;
  thumbnail: string;
  metadata: Record<string, string | number>;
  timestamp: number;
  expiresAt: number;
}

interface HistoryState {
  items: ImageHistoryItem[];
  version: string;
}

const HISTORY_VERSION = "1.0";
const EXPIRATION_HOURS = 24;
const MAX_ITEMS = 20;
const THUMBNAIL_SIZE = 80;

async function generateThumbnail(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context not available"));
        return;
      }

      const ratio = Math.min(THUMBNAIL_SIZE / img.width, THUMBNAIL_SIZE / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

export function useImageHistory(storageKey: string, enabled: boolean = true) {
  const [items, setItems] = useState<ImageHistoryItem[]>([]);
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

  const saveToStorage = useCallback((newItems: ImageHistoryItem[]) => {
    const state: HistoryState = {
      items: newItems,
      version: HISTORY_VERSION,
    };
    localStorage.setItem(fullKey, JSON.stringify(state));
  }, [fullKey]);

  const addItem = useCallback(
    async (
      originalFile: File,
      processedBlob: Blob,
      metadata: Record<string, string | number> = {}
    ): Promise<void> => {
      if (!enabled) return;

      try {
        const thumbnail = await generateThumbnail(processedBlob);
        const now = Date.now();

        const newItem: ImageHistoryItem = {
          id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
          originalName: originalFile.name,
          originalSize: originalFile.size,
          processedSize: processedBlob.size,
          thumbnail,
          metadata,
          timestamp: now,
          expiresAt: now + EXPIRATION_HOURS * 60 * 60 * 1000,
        };

        setItems((prev) => {
          const updated = [newItem, ...prev].slice(0, MAX_ITEMS);
          saveToStorage(updated);
          return updated;
        });
      } catch (error) {
        console.error("Failed to add history item:", error);
      }
    },
    [enabled, saveToStorage]
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

  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
    formatSize,
    formatTimestamp,
  };
}
