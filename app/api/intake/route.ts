import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const MAX_FILES = 10;
const MAX_TOTAL_MB = 20;
const MAX_EMAIL_ATTACHMENT_MB = 4;
const ADMIN_ATTACHMENT_URL_DAYS = 7;

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(200),
  company: z.string().min(1).max(120),
  phone: z.string().max(30).optional(),
  industry: z.string().min(1).max(120),
  teamSize: z.string().min(1).max(60),
  currentProcess: z.string().min(10).max(4000),
  currentTools: z.string().min(1).max(200),
  volume: z.string().min(1).max(200),
  stakeholders: z.string().min(1).max(200),
  issues: z.string().min(20).max(6000),
  goals: z.string().min(10).max(4000),
  successMetrics: z.string().max(400).optional(),
  budget: z.string().max(200).optional(),
  deadline: z.string().max(200).optional(),
  decisionMaker: z.string().max(200).optional(),
  constraints: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

type IntakePayload = z.infer<typeof schema>;

type UploadResult = {
  name: string;
  storagePath: string;
  size: number;
  contentType: string;
  attachmentContent?: string;
  signedUrl?: string;
};

function buildResponseId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `DIAG-${date}-${random}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function addMonths(date: Date, months: number) {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function optionalField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

async function uploadAttachments(
  files: File[],
  id: string
): Promise<UploadResult[]> {
  if (files.length === 0) return [];

  const { storage } = getFirebaseAdmin();
  const bucket = storage.bucket();

  const results: UploadResult[] = [];

  for (const [index, file] of files.entries()) {
    const buffer = Buffer.from(await file.arrayBuffer());

    const safeName = file.name
      .replace(/[^\w.\-]+/g, "_")
      .slice(0, 120) || `file-${index + 1}`;
    const storagePath = `intake/${id}/${Date.now()}-${index + 1}-${safeName}`;
    const contentType = file.type || "application/octet-stream";

    await bucket.file(storagePath).save(buffer, {
      contentType,
      resumable: false,
      metadata: {
        cacheControl: "private, max-age=0",
      },
    });

    const result: UploadResult = {
      name: file.name,
      storagePath,
      size: buffer.length,
      contentType,
    };

    if (buffer.length / (1024 * 1024) <= MAX_EMAIL_ATTACHMENT_MB) {
      result.attachmentContent = buffer.toString("base64");
    }

    try {
      const [signedUrl] = await bucket.file(storagePath).getSignedUrl({
        action: "read",
        expires: Date.now() + ADMIN_ATTACHMENT_URL_DAYS * 24 * 60 * 60 * 1000,
      });
      result.signedUrl = signedUrl;
    } catch {
      result.signedUrl = undefined;
    }

    results.push(result);
  }

  return results;
}

function buildAdminEmailText(payload: IntakePayload, id: string, attachments: UploadResult[]) {
  const rows = [
    "業務診断フォームの回答が届きました。",
    "",
    `回答ID: ${id}`,
    `お名前: ${payload.name}`,
    `メール: ${payload.email}`,
    `会社名・屋号: ${payload.company}`,
    `電話番号: ${payload.phone ?? "（未記入）"}`,
    `業種: ${payload.industry}`,
    `従業員規模: ${payload.teamSize}`,
    "",
    "現状の業務内容:",
    payload.currentProcess,
    "",
    `使用ツール: ${payload.currentTools}`,
    `件数・頻度: ${payload.volume}`,
    `関わる人数: ${payload.stakeholders}`,
    "",
    "課題:",
    payload.issues,
    "",
    "理想の状態:",
    payload.goals,
    "",
    `成功指標: ${payload.successMetrics ?? "（未記入）"}`,
    `予算感: ${payload.budget ?? "（未記入）"}`,
    `希望納期: ${payload.deadline ?? "（未記入）"}`,
    `決裁者: ${payload.decisionMaker ?? "（未記入）"}`,
    "",
    "制約・注意点:",
    payload.constraints ?? "（未記入）",
    "",
    "補足事項:",
    payload.notes ?? "（未記入）",
    "",
    "添付ファイル:",
    attachments.length
      ? attachments
          .map((item, index) => {
            const url = item.signedUrl ? `\n    URL: ${item.signedUrl}` : "";
            return `${index + 1}. ${item.name} (${formatBytes(item.size)})${url}`;
          })
          .join("\n")
      : "なし",
  ];

  return rows.join("\n");
}

function buildAdminEmailHtml(payload: IntakePayload, id: string, attachments: UploadResult[]) {
  const safe = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      escapeHtml(value ?? "（未記入）"),
    ])
  ) as Record<keyof IntakePayload, string>;

  const attachmentHtml = attachments.length
    ? `<ul style="margin: 8px 0 0; padding-left: 18px;">
        ${attachments
          .map(
            (item) => `
            <li style="margin-bottom: 6px; font-size: 13px;">
              ${escapeHtml(item.name)} (${formatBytes(item.size)})
              ${
                item.signedUrl
                  ? `<div><a href="${item.signedUrl}" style="color: #2563eb;">ダウンロードリンク</a></div>`
                  : ""
              }
            </li>`
          )
          .join("")}
      </ul>`
    : "<p style=\"margin: 0;\">なし</p>";

  return `
    <div style="background: #f5f7fb; padding: 24px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 24px;">
        <p style="margin: 0 0 8px; font-weight: 700; font-size: 18px;">業務診断フォームの回答</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">回答ID: ${escapeHtml(id)}</p>

        <table style="margin-top: 16px; width: 100%; font-size: 14px;">
          <tr><th style="text-align:left; padding: 6px 0; color:#64748b;">お名前</th><td>${safe.name}</td></tr>
          <tr><th style="text-align:left; padding: 6px 0; color:#64748b;">メール</th><td>${safe.email}</td></tr>
          <tr><th style="text-align:left; padding: 6px 0; color:#64748b;">会社名</th><td>${safe.company}</td></tr>
          <tr><th style="text-align:left; padding: 6px 0; color:#64748b;">電話番号</th><td>${safe.phone}</td></tr>
          <tr><th style="text-align:left; padding: 6px 0; color:#64748b;">業種</th><td>${safe.industry}</td></tr>
          <tr><th style="text-align:left; padding: 6px 0; color:#64748b;">規模</th><td>${safe.teamSize}</td></tr>
        </table>

        <div style="margin-top: 16px;">
          <p style="margin: 0 0 6px; font-weight: 600;">現状の業務内容</p>
          <p style="margin: 0; white-space: pre-wrap;">${safe.currentProcess}</p>
        </div>

        <div style="margin-top: 16px; display: grid; gap: 6px;">
          <p style="margin: 0;"><strong>使用ツール:</strong> ${safe.currentTools}</p>
          <p style="margin: 0;"><strong>件数・頻度:</strong> ${safe.volume}</p>
          <p style="margin: 0;"><strong>関わる人数:</strong> ${safe.stakeholders}</p>
        </div>

        <div style="margin-top: 16px;">
          <p style="margin: 0 0 6px; font-weight: 600;">課題</p>
          <p style="margin: 0; white-space: pre-wrap;">${safe.issues}</p>
        </div>

        <div style="margin-top: 16px;">
          <p style="margin: 0 0 6px; font-weight: 600;">理想の状態</p>
          <p style="margin: 0; white-space: pre-wrap;">${safe.goals}</p>
        </div>

        <div style="margin-top: 16px; display: grid; gap: 6px;">
          <p style="margin: 0;"><strong>成功指標:</strong> ${safe.successMetrics}</p>
          <p style="margin: 0;"><strong>予算感:</strong> ${safe.budget}</p>
          <p style="margin: 0;"><strong>希望納期:</strong> ${safe.deadline}</p>
          <p style="margin: 0;"><strong>決裁者:</strong> ${safe.decisionMaker}</p>
        </div>

        <div style="margin-top: 16px;">
          <p style="margin: 0 0 6px; font-weight: 600;">制約・注意点</p>
          <p style="margin: 0; white-space: pre-wrap;">${safe.constraints}</p>
        </div>

        <div style="margin-top: 16px;">
          <p style="margin: 0 0 6px; font-weight: 600;">補足事項</p>
          <p style="margin: 0; white-space: pre-wrap;">${safe.notes}</p>
        </div>

        <div style="margin-top: 16px;">
          <p style="margin: 0 0 6px; font-weight: 600;">添付ファイル</p>
          ${attachmentHtml}
        </div>
      </div>
    </div>
  `;
}

function buildUserEmailText(payload: IntakePayload, id: string) {
  return [
    `${payload.name}様`,
    "",
    "業務診断フォームの送信を受け付けました。",
    `回答ID: ${id}`,
    "",
    "このIDは今後の確認に必要になるため、保管をお願いいたします。",
    "",
    "内容を確認のうえ、折り返しご連絡いたします。",
    "本メールに心当たりがない場合は破棄してください。",
  ].join("\n");
}

function buildUserEmailHtml(payload: IntakePayload, id: string) {
  return `
    <div style="background: #f5f7fb; padding: 24px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 24px;">
        <p style="margin: 0 0 8px; font-weight: 700; font-size: 18px;">送信を受け付けました</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">${escapeHtml(payload.name)}様</p>
        <p style="margin: 16px 0 0;">業務診断フォームの送信を受け付けました。</p>
        <p style="margin: 12px 0 0; font-weight: 600;">回答ID</p>
        <p style="margin: 4px 0 0; font-size: 18px; letter-spacing: 0.08em;">${escapeHtml(id)}</p>
        <p style="margin: 16px 0 0; color: #6b7280; font-size: 13px;">
          このIDは今後の確認に必要になるため、保管をお願いいたします。
        </p>
      </div>
    </div>
  `;
}

async function sendEmail(apiKey: string, body: Record<string, unknown>) {
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
    return { ok: false, error: errorPayload };
  }

  return { ok: true };
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

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File);

  if (files.length > MAX_FILES) {
    return Response.json(
      { error: `添付は最大${MAX_FILES}件までです。` },
      { status: 400 }
    );
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes / (1024 * 1024) > MAX_TOTAL_MB) {
    return Response.json(
      { error: `添付の合計は${MAX_TOTAL_MB}MB以内にしてください。` },
      { status: 400 }
    );
  }

  let payload: IntakePayload;
  try {
    payload = schema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      phone: optionalField(formData.get("phone")),
      industry: formData.get("industry"),
      teamSize: formData.get("teamSize"),
      currentProcess: formData.get("currentProcess"),
      currentTools: formData.get("currentTools"),
      volume: formData.get("volume"),
      stakeholders: formData.get("stakeholders"),
      issues: formData.get("issues"),
      goals: formData.get("goals"),
      successMetrics: optionalField(formData.get("successMetrics")),
      budget: optionalField(formData.get("budget")),
      deadline: optionalField(formData.get("deadline")),
      decisionMaker: optionalField(formData.get("decisionMaker")),
      constraints: optionalField(formData.get("constraints")),
      notes: optionalField(formData.get("notes")),
    });
  } catch (error) {
    return Response.json(
      {
        error: "Invalid payload.",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 400 }
    );
  }

  try {
    const id = buildResponseId();
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(addMonths(now.toDate(), 2));

    const uploads = await uploadAttachments(files, id);
    const { firestore } = getFirebaseAdmin();

    await firestore.collection("intakeResponses").doc(id).set({
      id,
      status: "new",
      createdAt: now,
      updatedAt: now,
      expiresAt,
      ...payload,
      attachments: uploads.map((item) => ({
        name: item.name,
        storagePath: item.storagePath,
        size: item.size,
        contentType: item.contentType,
      })),
      meta: {
        userAgent: request.headers.get("user-agent") ?? "unknown",
        ip: getClientIp(request),
        origin: request.headers.get("origin") ?? "",
      },
    });

    const adminSubject = `【業務診断】${payload.company} ${payload.name}様 (${id})`;
    const adminBody: Record<string, unknown> = {
      from,
      to: [to],
      reply_to: payload.email,
      subject: adminSubject,
      text: buildAdminEmailText(payload, id, uploads),
      html: buildAdminEmailHtml(payload, id, uploads),
    };

    const emailAttachments = uploads
      .filter((item) => item.attachmentContent)
      .map((item) => ({
        filename: item.name,
        content: item.attachmentContent,
        content_type: item.contentType,
      }));

    let adminResult = { ok: true };
    if (emailAttachments.length > 0) {
      adminResult = await sendEmail(apiKey, {
        ...adminBody,
        attachments: emailAttachments,
      });
    }

    if (!adminResult.ok) {
      adminResult = await sendEmail(apiKey, adminBody);
    }

    const userResult = await sendEmail(apiKey, {
      from,
      to: [payload.email],
      reply_to: to,
      subject: "【Make It Tech】業務診断フォーム受付完了",
      text: buildUserEmailText(payload, id),
      html: buildUserEmailHtml(payload, id),
    });

    await firestore.collection("intakeResponses").doc(id).set(
      {
        adminEmailStatus: adminResult.ok ? "sent" : "failed",
        userEmailStatus: userResult.ok ? "sent" : "failed",
      },
      { merge: true }
    );

    return Response.json({ ok: true, id });
  } catch (error) {
    return Response.json(
      { error: "Server error.", details: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}
