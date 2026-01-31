"use client";

import { useState } from "react";
import type { ImageHistoryItem } from "../hooks/use-image-history";

interface ImageHistoryProps {
  items: ImageHistoryItem[];
  title?: string;
  onRemove: (id: string) => void;
  onClear: () => void;
  formatSize: (bytes: number) => string;
  formatTimestamp: (timestamp: number) => string;
  getTimeRemaining: (expiresAt: number) => string;
  renderBadge?: (item: ImageHistoryItem) => React.ReactNode;
}

export function ImageHistory({
  items,
  title = "変換履歴",
  onRemove,
  onClear,
  formatSize,
  formatTimestamp,
  getTimeRemaining,
  renderBadge,
}: ImageHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-left">
            <h3 className="font-medium">{title}</h3>
            <p className="text-xs text-neutral-500">
              {items.length}件 • 24時間後に自動削除
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-neutral-800">
          <div className="p-4">
            {/* Clear Button */}
            <div className="flex justify-end mb-3">
              <button
                onClick={onClear}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
              >
                履歴をクリア
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-neutral-800 rounded-lg overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full transition-colors"
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {/* Badge */}
                    {renderBadge && (
                      <div className="absolute top-1 right-1">
                        {renderBadge(item)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-xs truncate text-neutral-300" title={item.originalName}>
                      {item.originalName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-neutral-500">
                        {formatSize(item.processedSize)}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    {/* Expiration warning */}
                    {item.expiresAt - Date.now() < 60 * 60 * 1000 && (
                      <div className="mt-1 text-[10px] text-yellow-500">
                        残り {getTimeRemaining(item.expiresAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Privacy notice */}
            <p className="mt-4 text-[10px] text-neutral-600 text-center">
              履歴はブラウザ内のみに保存され、24時間後に自動削除されます
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
