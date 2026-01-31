"use client";

import { useState, useEffect } from "react";

type ConsentType = "all" | "necessary" | null;

interface CookieConsent {
  type: ConsentType;
  timestamp: number;
  version: string;
}

const CONSENT_KEY = "devtools_cookie_consent";
const CONSENT_VERSION = "1.0";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const consent: CookieConsent = JSON.parse(stored);
        // Check if consent version matches
        if (consent.version === CONSENT_VERSION && consent.type) {
          return; // Valid consent exists
        }
      } catch {
        // Invalid stored data
      }
    }
    // Show banner after a short delay for better UX
    const timer = setTimeout(() => setShowBanner(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const saveConsent = (type: ConsentType) => {
    const consent: CookieConsent = {
      type,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          animation: "slideUp 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-lg">プライバシー設定</h2>
              <p className="text-xs text-neutral-400">Cookie と データ保存について</p>
            </div>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            当サイトでは、サービス向上のためにCookieおよびローカルストレージを使用しています。
            すべてのファイル処理はブラウザ内で完結し、サーバーへ送信されることはありません。
          </p>
        </div>

        {/* Details (Expandable) */}
        {showDetails && (
          <div className="px-5 pb-4 space-y-3 border-t border-neutral-800 pt-4">
            {/* Necessary */}
            <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg">
              <div className="mt-0.5">
                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">必須Cookie</h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded">常に有効</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  サイトの基本機能に必要です。同意設定の保存に使用されます。
                </p>
              </div>
            </div>

            {/* Functional */}
            <div className="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg">
              <div className="mt-0.5">
                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">機能性ストレージ</h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded">推奨</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  変換履歴や設定の保存に使用します。24時間後に自動削除されます。
                  データは端末内のみに保存され、外部送信されません。
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div className="p-3 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
              <h4 className="text-xs font-medium text-neutral-300 mb-2">データ保持について</h4>
              <ul className="text-[11px] text-neutral-400 space-y-1">
                <li>• 同意設定: 1年間保持</li>
                <li>• 変換履歴: 24時間後に自動削除</li>
                <li>• ユーザー設定: 無期限（手動削除可能）</li>
              </ul>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 bg-neutral-800/30 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => saveConsent("all")}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              すべて許可
            </button>
            <button
              onClick={() => saveConsent("necessary")}
              className="flex-1 py-2.5 px-4 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              必須のみ
            </button>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-2 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {showDetails ? "詳細を閉じる" : "詳細を表示"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// Utility hook to check consent
export function useConsent() {
  const [consent, setConsent] = useState<ConsentType>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed: CookieConsent = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed.type);
        }
      } catch {
        // Invalid data
      }
    }
  }, []);

  return {
    hasConsent: consent !== null,
    allowsFunctional: consent === "all",
    consentType: consent,
  };
}
