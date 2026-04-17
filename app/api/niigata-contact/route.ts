import { z } from "zod";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const MIN_SUBMIT_TIME_MS = 3000;

type RateLimitEntry = { count: number; resetAt: number };

const globalForRateLimit = globalThis as typeof globalThis & {
  niigataContactRateLimit?: Map<string, RateLimitEntry>;
};
const rateLimitMap =
  globalForRateLimit.niigataContactRateLimit ??
  new Map<string, RateLimitEntry>();
globalForRateLimit.niigataContactRateLimit = rateLimitMap;

const MEETING_LABELS: Record<string, string> = {
  "online":     "オンライン（Zoom）",
  "in-person":  "対面（訪問）",
  "either":     "どちらでも可",
};

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(200),
  company: z.string().max(120).optional(),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+()\-\s]{8,20}$/.test(v)),
  meetingType: z.enum(["online", "in-person", "either"]),
  message: z.string().min(10).max(2000),
  consent: z.boolean().refine((v) => v === true),
  website: z.string().optional(), // honeypot
  startedAt: z.coerce.number().min(1),
});

type Payload = z.infer<typeof schema>;

function esc(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getClientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function buildHtml(p: Payload) {
  const accent   = "#E2673D";
  const dark     = "#1C2C34";
  const muted    = "#6B7280";
  const border   = "#E5E7EB";
  const panel    = "#F8FAFC";
  const headerBg = "#1C2C34";
  const receivedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  const rows: [string, string][] = [
    ["お名前",     esc(p.name)],
    ["メール",     esc(p.email)],
    ["会社名・屋号", esc(p.company ?? "（未記入）")],
    ["電話番号",   esc(p.phone?.trim() ? p.phone : "（未記入）")],
    ["希望相談方法", esc(MEETING_LABELS[p.meetingType] ?? p.meetingType)],
  ];

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Make It Tech</title>
</head>
<body style="margin:0;padding:0;background:#F1F3F5;font-family:system-ui,-apple-system,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F3F5;padding:28px 0;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border:1px solid ${border};border-radius:20px;overflow:hidden;">
      <tr>
        <td style="background:${headerBg};padding:20px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:middle;">
                <span style="font-size:17px;font-weight:700;color:#fff;">Make It Tech</span>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="display:inline-block;padding:5px 14px;border-radius:999px;background:${accent};color:#fff;font-size:12px;font-weight:700;">新潟ページ お問い合わせ</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px 8px;">
          <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:${dark};">新潟ページからお問い合わせが届きました。</p>
          <p style="margin:0;font-size:12px;color:${muted};">受信日時: ${receivedAt}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:1px solid ${border};">
            ${rows.map(([label, value]) => `
            <tr>
              <th style="text-align:left;padding:10px 12px 10px 0;font-size:13px;color:${muted};font-weight:600;width:130px;white-space:nowrap;">${label}</th>
              <td style="padding:10px 0;font-size:14px;color:${dark};">${value}</td>
            </tr>`).join("")}
          </table>

          <div style="margin-top:16px;background:${panel};border:1px solid ${border};border-radius:12px;padding:16px 20px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${dark};">相談内容</p>
            <p style="margin:0;font-size:14px;color:${dark};white-space:pre-wrap;">${esc(p.message)}</p>
          </div>

          <p style="margin:16px 0 0;font-size:12px;color:${muted};">
            返信は ${esc(p.email)} 宛に行ってください（Reply-To 設定済み）。
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#F1F3F5;padding:16px 28px;border-top:1px solid ${border};">
          <p style="margin:0;font-size:11px;color:#9CA3AF;">Make It Tech &nbsp;·&nbsp; https://make-it-tech.com</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function buildText(p: Payload) {
  return [
    "【新潟ページ】お問い合わせが届きました",
    "=".repeat(40),
    `お名前: ${p.name}`,
    `メール: ${p.email}`,
    `会社名・屋号: ${p.company ?? "（未記入）"}`,
    `電話番号: ${p.phone?.trim() ? p.phone : "（未記入）"}`,
    `希望相談方法: ${MEETING_LABELS[p.meetingType] ?? p.meetingType}`,
    "",
    "相談内容:",
    p.message,
    "",
    "─".repeat(40),
    "Make It Tech",
    "https://make-it-tech.com",
  ].join("\n");
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from   = process.env.RESEND_FROM?.trim();
  const to     = process.env.RESEND_TO?.trim();

  if (!apiKey || !from || !to) {
    return Response.json({ error: "設定エラーです。" }, { status: 500 });
  }

  let payload: Payload;
  try {
    payload = schema.parse(await request.json());
  } catch {
    return Response.json({ error: "入力内容が不正です。" }, { status: 400 });
  }

  // honeypot
  if (payload.website?.trim()) {
    return Response.json({ error: "Spam detected." }, { status: 400 });
  }

  // 送信速度チェック
  const elapsed = Date.now() - payload.startedAt;
  if (Number.isFinite(elapsed) && elapsed < MIN_SUBMIT_TIME_MS) {
    return Response.json({ error: "Submission too fast." }, { status: 429 });
  }

  // レート制限
  const ip  = getClientIp(request);
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (entry && entry.resetAt > now && entry.count >= RATE_LIMIT_MAX) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }
  if (entry && entry.resetAt > now) {
    entry.count += 1;
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `【新潟ページ】${payload.name}様からのご相談`,
      html: buildHtml(payload),
      text: buildText(payload),
    }),
  });

  if (!res.ok) {
    return Response.json({ error: "送信に失敗しました。" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
