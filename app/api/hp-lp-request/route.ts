import { z } from "zod";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 8;
const MIN_SUBMIT_TIME_MS = 2500;
const FIXED_TO = "info@make-it-tech.com";

type RateLimitEntry = { count: number; resetAt: number };

const globalForRateLimit = globalThis as typeof globalThis & {
  hpLpRequestRateLimit?: Map<string, RateLimitEntry>;
};
const rateLimitMap =
  globalForRateLimit.hpLpRequestRateLimit ?? new Map<string, RateLimitEntry>();
globalForRateLimit.hpLpRequestRateLimit = rateLimitMap;

const schema = z.object({
  formType: z.enum(["おまかせで相談する", "希望を詳しく伝える"]),
  company: z.string().min(1).max(120),
  name: z.string().min(1).max(80),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional(),
  business: z.string().min(10).max(2500),
  customers: z.string().min(1).max(1500),
  requestType: z.enum(["ホームページ", "LP", "どちらが合うか相談したい"]),
  mainGoal: z.string().min(1).max(1500),
  services: z.string().min(1).max(2500),
  mustHave: z.string().min(1).max(2500),
  strengths: z.string().min(1).max(2000),
  faq: z.string().max(2000).optional(),
  links: z.string().max(2000).optional(),
  assets: z.string().min(1).max(1000),
  contactMethods: z.array(z.string()).min(1).max(8),
  afterUpdates: z.string().max(1500).optional(),
  notes: z.string().max(2000).optional(),
  desiredPages: z.string().max(2000).optional(),
  designNotes: z.string().max(2000).optional(),
  deadline: z.string().max(500).optional(),
  support: z.enum(["希望する", "相談したい", "不要"]),
  consent: z.boolean().refine((value) => value === true),
  website: z.string().optional(),
  startedAt: z.coerce.number().min(1),
});

type Payload = z.infer<typeof schema>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function optional(value?: string) {
  return value?.trim() ? value.trim() : "（未記入）";
}

function formatText(payload: Payload) {
  return [
    "HP/LP制作要望フォームが送信されました。",
    "",
    `入力タイプ: ${payload.formType}`,
    `制作したいもの: ${payload.requestType}`,
    `会社名・屋号: ${payload.company}`,
    `担当者名: ${payload.name}`,
    `メール: ${payload.email}`,
    `電話番号: ${optional(payload.phone)}`,
    "",
    "業種・事業内容:",
    payload.business,
    "",
    "主な対象・お客様:",
    payload.customers,
    "",
    "サイトで実現したいこと:",
    payload.mainGoal,
    "",
    "掲載したいサービス・商品:",
    payload.services,
    "",
    "必ず掲載したい情報:",
    payload.mustHave,
    "",
    "伝えたい強み・大切にしていること:",
    payload.strengths,
    "",
    `サイトに掲載したい連絡方法: ${payload.contactMethods.join(", ")}`,
    `ロゴ・写真・資料: ${payload.assets}`,
    `公開後サポート: ${payload.support}`,
    "",
    `よく聞かれること: ${optional(payload.faq)}`,
    `既存サイト・SNS等: ${optional(payload.links)}`,
    `公開後に更新したい内容: ${optional(payload.afterUpdates)}`,
    `必要ページ・構成: ${optional(payload.desiredPages)}`,
    `デザイン・参考サイト希望: ${optional(payload.designNotes)}`,
    `希望公開時期: ${optional(payload.deadline)}`,
    "",
    "その他:",
    optional(payload.notes),
  ].join("\n");
}

function row(label: string, value: string) {
  return `
    <tr>
      <th style="width: 160px; text-align: left; vertical-align: top; padding: 10px 12px 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(label)}</th>
      <td style="padding: 10px 0; color: #1c2c34; font-size: 14px; line-height: 1.7; white-space: pre-wrap; border-bottom: 1px solid #e5e7eb;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function section(title: string, rows: string) {
  return `
    <div style="margin-top: 18px;">
      <p style="margin: 0 0 8px; color: #1c2c34; font-size: 15px; font-weight: 700;">${escapeHtml(title)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">${rows}</table>
    </div>
  `;
}

function formatHtml(payload: Payload) {
  const receivedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const badge = (text: string, color = "#e2673d") =>
    `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 10px;border-radius:999px;background:${color}1a;color:${color};font-size:12px;font-weight:700;">${escapeHtml(text)}</span>`;

  return `
    <div style="background:#f4f5f7;padding:24px;font-family:'Noto Sans JP','Yu Gothic','Meiryo',system-ui,sans-serif;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;padding:24px;">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
          <div>
            <p style="margin:0;color:#1c2c34;font-size:20px;font-weight:800;">HP/LP制作要望フォーム</p>
            <p style="margin:6px 0 0;color:#64748b;font-size:13px;">受信日時: ${escapeHtml(receivedAt)}</p>
          </div>
          <div style="text-align:right;">
            ${badge(payload.formType)}
            ${badge(payload.requestType, "#2a9d91")}
          </div>
        </div>

        ${section(
          "連絡先",
          row("会社名・屋号", payload.company) +
            row("担当者名", payload.name) +
            row("メール", payload.email) +
            row("電話番号", optional(payload.phone))
        )}

        ${section(
          "制作内容",
          row("業種・事業内容", payload.business) +
            row("主な対象・お客様", payload.customers) +
            row("サイトで実現したいこと", payload.mainGoal) +
            row("掲載したいサービス・商品", payload.services) +
            row("必ず掲載したい情報", payload.mustHave) +
            row("伝えたい強み・大切にしていること", payload.strengths)
        )}

        ${section(
          "素材・導線・運用",
          row("サイトに掲載したい連絡方法", payload.contactMethods.join(", ")) +
            row("ロゴ・写真・資料", payload.assets) +
            row("公開後サポート", payload.support) +
            row("公開後に更新したい内容", optional(payload.afterUpdates)) +
            row("既存サイト・SNSなど", optional(payload.links)) +
            row("お客様からよく聞かれること", optional(payload.faq))
        )}

        ${section(
          "詳細指定・補足",
          row("必要ページ・構成", optional(payload.desiredPages)) +
            row("デザイン・参考サイト希望", optional(payload.designNotes)) +
            row("希望公開時期", optional(payload.deadline)) +
            row("その他", optional(payload.notes))
        )}

        <p style="margin:18px 0 0;color:#64748b;font-size:12px;">
          Reply-To は ${escapeHtml(payload.email)} に設定されています。
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey || !from) {
    return Response.json({ error: "Email settings are missing." }, { status: 500 });
  }

  const userAgent = request.headers.get("user-agent");
  if (!userAgent) {
    return Response.json({ error: "Missing user agent." }, { status: 400 });
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return Response.json({ error: "Invalid origin." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Invalid origin." }, { status: 403 });
    }
  }

  let payload: Payload;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid payload.", details: error instanceof Error ? error.message : undefined },
      { status: 400 }
    );
  }

  if (payload.website?.trim()) {
    return Response.json({ error: "Spam detected." }, { status: 400 });
  }

  const elapsed = Date.now() - payload.startedAt;
  if (Number.isFinite(elapsed) && elapsed < MIN_SUBMIT_TIME_MS) {
    return Response.json({ error: "Submission too fast." }, { status: 429 });
  }

  const clientIp = getClientIp(request);
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);
  if (entry && entry.resetAt > now && entry.count >= RATE_LIMIT_MAX) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }
  if (entry && entry.resetAt > now) {
    entry.count += 1;
  } else {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [FIXED_TO],
      reply_to: payload.email,
      subject: `【HP/LP制作相談】${payload.company} ${payload.name}様`,
      text: formatText(payload),
      html: formatHtml(payload),
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    return Response.json(
      { error: "Failed to send email.", details: errorPayload },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
