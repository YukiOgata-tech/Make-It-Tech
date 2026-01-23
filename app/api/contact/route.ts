import { z } from "zod";

const categories = [
  "Web制作（LP/店舗サイト/採用など）",
  "業務改善（フロー整理/属人化解消）",
  "ツール導入（LINE/フォーム/管理シート）",
  "自動化（通知/集計/連携）",
  "その他/相談して決めたい",
] as const;

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  category: z
    .string()
    .min(1)
    .refine((value) => (categories as readonly string[]).includes(value)),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  message: z.string().min(20),
  consent: z.boolean().refine((value) => value === true),
});

type ContactPayload = z.infer<typeof schema>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatEmailText(payload: ContactPayload) {
  return [
    "Webサイトからお問い合わせが届きました。",
    "",
    `お名前: ${payload.name}`,
    `メール: ${payload.email}`,
    `会社名・屋号: ${payload.company ?? "（未記入）"}`,
    `相談カテゴリ: ${payload.category}`,
    `予算感: ${payload.budget ?? "未定"}`,
    `希望納期: ${payload.deadline ?? "未定"}`,
    "",
    "相談内容:",
    payload.message,
  ].join("\n");
}

function formatEmailHtml(payload: ContactPayload) {
  const safe = {
    name: escapeHtml(payload.name),
    email: escapeHtml(payload.email),
    company: escapeHtml(payload.company ?? "（未記入）"),
    category: escapeHtml(payload.category),
    budget: escapeHtml(payload.budget ?? "未定"),
    deadline: escapeHtml(payload.deadline ?? "未定"),
    message: escapeHtml(payload.message),
  };

  const lines = [
    ["お名前", safe.name],
    ["メール", safe.email],
    ["会社名・屋号", safe.company],
    ["相談カテゴリ", safe.category],
    ["予算感", safe.budget],
    ["希望納期", safe.deadline],
  ];

  const receivedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const accent = "#E2673D";
  const ink = "#1C2C34";
  const muted = "#6B7280";
  const border = "#E5E7EB";
  const panel = "#F8FAFC";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #F4F5F7; padding: 24px 0; font-family: system-ui, -apple-system, sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 640px;">
            <tr>
              <td style="background: #ffffff; border: 1px solid ${border}; border-radius: 16px; padding: 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: ${ink}; font-size: 18px; font-weight: 700;">
                      Make It Tech
                    </td>
                    <td align="right">
                      <span style="display: inline-block; padding: 6px 12px; border-radius: 999px; background: ${panel}; color: ${ink}; font-size: 12px; font-weight: 600;">
                        お問い合わせ
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin: 16px 0 0; color: ${ink}; font-size: 16px; font-weight: 600;">
                  Webサイトからお問い合わせが届きました。
                </p>
                <p style="margin: 6px 0 0; color: ${muted}; font-size: 13px;">
                  受信日時: ${receivedAt}
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                  <tr>
                    <td style="padding: 0 8px 8px 0;">
                      <span style="display: inline-block; padding: 6px 12px; border-radius: 999px; background: ${accent}1A; color: ${accent}; font-size: 12px; font-weight: 600;">
                        ${safe.category}
                      </span>
                    </td>
                    <td style="padding: 0 8px 8px 0;">
                      <span style="display: inline-block; padding: 6px 12px; border-radius: 999px; background: ${panel}; color: ${muted}; font-size: 12px; font-weight: 600;">
                        予算: ${safe.budget}
                      </span>
                    </td>
                    <td style="padding: 0 8px 8px 0;">
                      <span style="display: inline-block; padding: 6px 12px; border-radius: 999px; background: ${panel}; color: ${muted}; font-size: 12px; font-weight: 600;">
                        納期: ${safe.deadline}
                      </span>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 12px; border-top: 1px solid ${border};">
                  ${lines
                    .map(
                      ([label, value]) => `
                        <tr>
                          <th style="text-align: left; padding: 10px 12px 10px 0; font-size: 13px; color: ${muted}; font-weight: 600; width: 140px;">
                            ${label}
                          </th>
                          <td style="padding: 10px 0; font-size: 14px; color: ${ink};">
                            ${value}
                          </td>
                        </tr>`
                    )
                    .join("")}
                </table>

                <div style="margin-top: 16px; background: ${panel}; border: 1px solid ${border}; border-radius: 12px; padding: 16px;">
                  <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: ${ink};">
                    相談内容
                  </p>
                  <p style="margin: 0; font-size: 14px; color: ${ink}; white-space: pre-wrap;">
                    ${safe.message}
                  </p>
                </div>

                <p style="margin: 16px 0 0; font-size: 12px; color: ${muted};">
                  返信は ${safe.email} 宛に行ってください（Reply-To 設定済み）。
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const to = process.env.RESEND_TO?.trim();

  if (!apiKey || !from || !to) {
    return Response.json(
      { error: "Email settings are missing." },
      { status: 500 }
    );
  }

  let payload: ContactPayload;

  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid payload.", details: error instanceof Error ? error.message : undefined },
      { status: 400 }
    );
  }

  const subject = `【お問い合わせ】${payload.name}様`;
  const body = {
    from,
    to: [to],
    reply_to: payload.email,
    subject,
    text: formatEmailText(payload),
    html: formatEmailHtml(payload),
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
