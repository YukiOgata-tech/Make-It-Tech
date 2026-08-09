import { stampConfig } from "@/content/nfc/stamp";

/**
 * 来店回数を端末に持たせるための Cookie 操作。
 *
 * サーバー側で読み書きするため、判定のために画面を表示する必要がない。
 * localStorage だと JS の実行を待つあいだ中間ページが見えてしまう。
 *
 * デモ用のため署名は付けていない。実運用で特典に価値を持たせる場合は
 * HMAC を付けて改ざんを検知する必要がある（ただし端末側の記録である以上、
 * 消してやり直すことは原理的に防げない）。
 */

export const STAMP_COOKIE = "mit_nfc_card";
export const STAMP_MAX_AGE = 60 * 60 * 24 * stampConfig.retentionDays;

export type StampState = {
  /** 出会った回数 */
  count: number;
  /** 端末を区別するための匿名ID。集計にのみ使い、個人は特定しない。 */
  deviceId: string;
  /** 初回にかざした日（JST の YYYY-MM-DD） */
  firstAt: string;
};

export function jstDateString(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseStamp(raw: string | undefined): StampState | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return null;

    const { count, deviceId, firstAt } = parsed as Partial<StampState>;
    if (typeof count !== "number" || !Number.isFinite(count) || count < 0) return null;
    if (typeof deviceId !== "string" || deviceId.length === 0) return null;

    return {
      count: Math.floor(count),
      deviceId,
      firstAt: typeof firstAt === "string" ? firstAt : jstDateString(),
    };
  } catch {
    return null;
  }
}

export function serializeStamp(state: StampState) {
  return encodeURIComponent(JSON.stringify(state));
}

/**
 * 1回分進めた状態を返す。
 *
 * 実運用では「同じ日は数えない」制限を入れる想定だが、デモでは商談中に
 * 3回まで進めてもらう必要があるため、毎回数える。日付での抑制を入れる場合は
 * ここで前回日と jstDateString() を比較する。
 */
export function advanceStamp(current: StampState | null): {
  next: StampState;
  isNewDevice: boolean;
} {
  if (!current) {
    return {
      next: { count: 1, deviceId: crypto.randomUUID(), firstAt: jstDateString() },
      isNewDevice: true,
    };
  }

  return {
    next: { ...current, count: current.count + 1 },
    isNewDevice: false,
  };
}
