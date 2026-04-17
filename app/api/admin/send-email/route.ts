import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  buildEmailHtml,
  buildEmailText,
  type EmailType,
} from "@/lib/admin-email-template";

const ctaButtonSchema = z.object({
  label: z.string().min(1).max(80),
  url: z.string().url().max(500),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#E2673D"),
});

const attachmentSchema = z.object({
  filename: z.string().min(1).max(255),
  content: z.string().min(1),
  content_type: z.string().max(100).optional(), // mobile では空の場合がある
});

const schema = z.object({
  to: z.string().email().max(200),
  toName: z.string().max(100),
  subject: z.string().min(1).max(200),
  type: z.enum(["reply", "sales", "notice", "custom"]),
  greeting: z.string().min(1).max(1000),
  body: z.string().min(1).max(5000),
  ctaButtons: z.array(ctaButtonSchema).max(4).optional(),
  closing: z.string().max(500).optional(),
  attachments: z.array(attachmentSchema).max(5).optional(),
  fromKey: z.enum(["default", "manual"]).default("default"),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromDefault = process.env.RESEND_FROM?.trim();
  const fromManual  = process.env.RESEND_FROM_MANUAL?.trim();

  if (!apiKey || !fromDefault) {
    return Response.json(
      { error: "メール送信設定が不足しています。" },
      { status: 500 }
    );
  }

  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return Response.json(
      {
        error: "入力内容が不正です。",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 400 }
    );
  }

  const attachmentCount = payload.attachments?.length ?? 0;

  const templateParams = {
    toName: payload.toName,
    toEmail: payload.to,
    type: payload.type as EmailType,
    greeting: payload.greeting,
    body: payload.body,
    ctaButtons: payload.ctaButtons,
    closing: payload.closing || undefined,
    attachmentCount,
  };

  const from =
    payload.fromKey === "manual" && fromManual ? fromManual : fromDefault;

  const emailBody: Record<string, unknown> = {
    from,
    to: [payload.to],
    subject: payload.subject,
    html: buildEmailHtml(templateParams),
    text: buildEmailText(templateParams),
  };

  if (payload.attachments && payload.attachments.length > 0) {
    emailBody.attachments = payload.attachments.map((a) => {
      const att: Record<string, string> = {
        filename: a.filename,
        content: a.content,
      };
      if (a.content_type) att.content_type = a.content_type;
      return att;
    });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailBody),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    return Response.json(
      { error: "メールの送信に失敗しました。", details: errorPayload },
      { status: 502 }
    );
  }

  const result = await response.json().catch(() => ({ ok: true }));
  return Response.json({ ok: true, id: result.id });
}
