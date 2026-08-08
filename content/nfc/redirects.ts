/**
 * カスタマイズNFC（中間URL方式）のリンク定義。
 *
 * NFCタグには最終的な行き先ではなく `nfc.make-it-tech.com/r/{slug}` を書き込む。
 * かざされた時点でこの定義を評価して行き先を決めるため、タグを書き換えずに
 * リンク先を変更したり、条件によって行き先を切り替えたりできる。
 *
 * 現在は定義をこのファイルに直接持っている。管理画面から編集できるようにする
 * 段階で Firestore へ移すが、`NfcLink` の形はそのまま使えるようにしてある。
 */

/** 行き先。アプリを開きたい場合は `app` を使い、未インストール時は webUrl に落とす。 */
export type NfcTarget =
  | { kind: "url"; label: string; url: string }
  | { kind: "app"; label: string; appUrl: string; webUrl: string };

export type NfcTimeSlot = {
  /** JST の開始時（0-23）。含む。 */
  fromHour: number;
  /** JST の終了時（0-23）。含まない。fromHour より小さい場合は日をまたぐ。 */
  toHour: number;
  label: string;
  target: NfcTarget;
};

export type NfcLink = {
  slug: string;
  name: string;
  description: string;
  /** 上から評価し、最初に一致したスロットを使う。 */
  slots: NfcTimeSlot[];
  /** どのスロットにも該当しない場合の行き先。 */
  fallback: NfcTarget;
};

/**
 * 実例デモ。
 * 日中（6:00-18:00）は d-mise のアプリ紹介ページ、
 * 夜間（18:00-6:00）は ChatGPT アプリ（無ければ Web 版）を開く。
 */
export const nfcDemoLink: NfcLink = {
  slug: "demo",
  name: "時間帯で行き先が変わるNFC",
  description:
    "同じスタンドにかざしても、昼と夜で開くページが変わります。タグの書き換えは不要です。",
  slots: [
    {
      fromHour: 6,
      toHour: 18,
      label: "日中（6:00-18:00）",
      target: {
        kind: "url",
        label: "d-mise アプリ紹介",
        url: "https://d-mise.com/app",
      },
    },
    {
      fromHour: 18,
      toHour: 6,
      label: "夜間（18:00-6:00）",
      target: {
        kind: "app",
        label: "ChatGPT",
        // インストール済みならアプリが起動し、無ければ webUrl に落ちる
        appUrl: "chatgpt://",
        webUrl: "https://chatgpt.com/",
      },
    },
  ],
  fallback: {
    kind: "url",
    label: "d-mise アプリ紹介",
    url: "https://d-mise.com/app",
  },
};

export const nfcLinkRegistry: NfcLink[] = [nfcDemoLink];

export function findNfcLink(slug: string) {
  return nfcLinkRegistry.find((link) => link.slug === slug);
}

/**
 * 日本時間の「時」を取り出す。
 *
 * Vercel のサーバーは UTC で動くため、店舗の営業時間で判定するには
 * タイムゾーンを明示して変換する必要がある。端末のローカル時刻ではなく
 * JST 固定にしているのは、旅行者の端末など時計がずれている場合でも
 * 店舗側の想定どおりに切り替えるため。
 */
export function getJstHour(now: Date = new Date()) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    hour: "numeric",
    hourCycle: "h23",
  }).format(now);

  return Number(hour);
}

function isHourInSlot(hour: number, fromHour: number, toHour: number) {
  if (fromHour === toHour) return true;
  // 日をまたがない（例: 6-18）
  if (fromHour < toHour) return hour >= fromHour && hour < toHour;
  // 日をまたぐ（例: 18-6）
  return hour >= fromHour || hour < toHour;
}

/** 指定時刻に適用されるスロットを返す。該当しなければ null。 */
export function resolveSlot(link: NfcLink, now: Date = new Date()) {
  const hour = getJstHour(now);
  return link.slots.find((slot) => isHourInSlot(hour, slot.fromHour, slot.toHour)) ?? null;
}

/** 指定時刻の行き先を返す。 */
export function resolveTarget(link: NfcLink, now: Date = new Date()): NfcTarget {
  return resolveSlot(link, now)?.target ?? link.fallback;
}
