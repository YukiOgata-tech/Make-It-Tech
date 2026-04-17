export type EmailType = "reply" | "sales" | "notice" | "custom";

export interface CtaButton {
  label: string;
  url: string;
  color: string; // hex
}

export interface EmailTemplateParams {
  toName: string;
  toEmail?: string; // fallback display when toName is empty
  type: EmailType;
  greeting: string;
  body: string;
  ctaButtons?: CtaButton[];
  closing?: string;
  attachmentCount?: number;
}

// ── Brand tokens ──────────────────────────────────────────────────────────────

const B = {
  accent:      "#E2673D",
  accentLight: "#FDF0EB",
  accentDark:  "#FB923C", // lighter orange for dark bg contrast
  dark:        "#1C2C34",
  muted:       "#6B7280",
  border:      "#E5E7EB",
  bg:          "#F1F3F5",
  white:       "#FFFFFF",
  panel:       "#F8FAFC",
  headerBg:    "#1C2C34",
  footerBg:    "#F1F3F5",
  siteUrl:     "https://make-it-tech.com",
  logoUrl:     "https://make-it-tech.com/images/logo-02_MIT-normal.png",
  contactUrl:  "https://make-it-tech.com/contact",
} as const;

export const TYPE_LABELS: Record<EmailType, string> = {
  reply:  "お問い合わせ返信",
  sales:  "ご提案",
  notice: "ご連絡",
  custom: "お知らせ",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(str: string) {
  return esc(str).replace(/\n/g, "<br>");
}

/** Compute white or dark text for a given hex background */
function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#1C2C34" : "#ffffff";
}

// ── Template ──────────────────────────────────────────────────────────────────

export function buildEmailHtml(params: EmailTemplateParams): string {
  const {
    toName,
    toEmail,
    type,
    greeting,
    body,
    ctaButtons,
    closing,
    attachmentCount,
  } = params;

  const typeLabel = TYPE_LABELS[type];

  // If toName is empty, fall back to email address
  const displayName = toName.trim() || toEmail || "";

  const now = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── CTA Buttons block ──────────────────────────────────────────────────────
  const ctaBlock =
    ctaButtons && ctaButtons.length > 0
      ? `
    <!-- CTA Buttons -->
    <tr>
      <td align="center" style="padding: 4px 0 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            ${ctaButtons
              .map((btn) => {
                const bg = btn.color || B.accent;
                const fg = contrastColor(bg);
                return `
            <td style="padding: 0 6px 8px 0;">
              <a href="${esc(btn.url)}"
                 target="_blank" rel="noopener noreferrer"
                 class="cta-btn"
                 style="display:inline-block;padding:13px 28px;background:${bg};color:${fg};font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.02em;font-family:system-ui,-apple-system,sans-serif;white-space:nowrap;">
                ${esc(btn.label)}
              </a>
            </td>`;
              })
              .join("")}
          </tr>
        </table>
      </td>
    </tr>`
      : "";

  // ── Attachment notice ──────────────────────────────────────────────────────
  const attachmentBlock =
    attachmentCount && attachmentCount > 0
      ? `
    <!-- Attachment notice -->
    <tr>
      <td style="padding: 0 0 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="background:#FDF0EB;border:1px solid #F5C9B8;border-radius:8px;padding:10px 14px;">
              <p style="margin:0;font-size:12px;color:#B0471E;font-family:system-ui,-apple-system,sans-serif;">
                📎 このメールには <strong>${attachmentCount}</strong> 件の添付ファイルがあります。ご確認ください。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
      : "";

  // ── Closing block ──────────────────────────────────────────────────────────
  const closingBlock = closing
    ? `
    <!-- Closing -->
    <tr>
      <td class="dm-text" style="padding: 8px 0 24px; font-size:14px; line-height:1.85; color:${B.dark}; font-family:system-ui,-apple-system,sans-serif;">
        ${nl2br(closing)}
      </td>
    </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Make It Tech</title>
<style>

/* ── Reset ── */
body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0; mso-table-rspace: 0; border-collapse: collapse; }
img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

/* ── Dark mode overrides ── */
@media (prefers-color-scheme: dark) {
  .dm-outer    { background-color: #0D1117 !important; }
  .dm-card     { background-color: #161B22 !important; border-color: #30363D !important; }
  .dm-body-wrap { background-color: #161B22 !important; }
  .dm-text     { color: #E6EDF3 !important; }
  .dm-muted    { color: #8B949E !important; }
  .dm-panel    { background-color: #0D1117 !important; border-color: #30363D !important; border-left-color: #FB923C !important; }
  .dm-divider  { border-top-color: #30363D !important; }
  .dm-footer-bg { background-color: #0D1117 !important; }
  .dm-footer-link-btn {
    background-color: #21262D !important;
    color: #8B949E !important;
    border-color: #30363D !important;
  }
  .dm-footer-link-accent { color: #FB923C !important; }
  .dm-footer-subdesc { color: #8B949E !important; }
  .dm-footer-note { color: #484F58 !important; }
  .dm-attach-notice {
    background-color: #271A10 !important;
    border-color: #7C3A1A !important;
  }
  .dm-attach-text { color: #FB923C !important; }
}

/* ── Mobile ── */
@media only screen and (max-width: 600px) {
  .email-outer   { padding: 8px 0 !important; }
  .email-card    { border-radius: 16px !important; }
  .card-inner    { padding: 20px 16px !important; }
  .header-cell   { padding: 16px 20px !important; border-radius: 12px 12px 0 0 !important; }
  .logo-img      { width: 32px !important; height: 32px !important; }
  .brand-name    { font-size: 15px !important; }
  .type-badge    { font-size: 11px !important; padding: 4px 10px !important; }
  .body-text     { font-size: 14px !important; }
  .cta-btn       { padding: 11px 20px !important; font-size: 13px !important; }
  .footer-cell   { padding: 16px 20px !important; border-radius: 0 0 12px 12px !important; }
  .footer-text   { font-size: 11px !important; }
}

</style>
</head>
<body class="dm-outer" style="margin:0;padding:0;background:${B.bg};-webkit-font-smoothing:antialiased;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       class="email-outer dm-outer"
       style="background:${B.bg};padding:28px 0;">
  <tr>
    <td align="center">

      <!-- Card -->
      <table role="presentation" cellpadding="0" cellspacing="0"
             class="email-card dm-card"
             style="width:100%;max-width:600px;background:${B.white};border:1px solid ${B.border};border-radius:20px;">
        <tr>
          <td style="padding:0;border-radius:20px;overflow:hidden;">

            <!-- ══ HEADER ══ -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="header-cell"
                    style="background:${B.headerBg};padding:20px 28px;border-radius:20px 20px 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="vertical-align:middle;padding-right:10px;">
                              <img src="${B.logoUrl}"
                                   alt="Make It Tech"
                                   width="36" height="36"
                                   class="logo-img"
                                   style="display:block;width:36px;height:36px;object-fit:contain;border-radius:7px;">
                            </td>
                            <td style="vertical-align:middle;">
                              <span class="brand-name"
                                    style="font-size:17px;font-weight:700;color:#FFFFFF;letter-spacing:-0.01em;font-family:system-ui,-apple-system,sans-serif;">
                                Make It Tech
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td align="right" style="vertical-align:middle;">
                        <span class="type-badge"
                              style="display:inline-block;padding:5px 14px;border-radius:999px;background:${B.accent};color:#ffffff;font-size:12px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;white-space:nowrap;">
                          ${typeLabel}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <!-- /HEADER -->

            <!-- ══ BODY ══ -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   class="dm-body-wrap"
                   style="background:${B.white};">
              <tr>
                <td class="card-inner dm-body-wrap" style="padding:28px 28px 4px;background:${B.white};">

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                    <!-- Salutation -->
                    <tr>
                      <td style="padding-bottom:18px;">
                        <span class="body-text dm-text"
                              style="font-size:16px;font-weight:600;color:${B.dark};line-height:1.6;font-family:system-ui,-apple-system,sans-serif;">
                          ${displayName ? `${esc(displayName)} 様` : ""}
                        </span>
                      </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                      <td style="padding-bottom:20px;">
                        <p class="body-text dm-text"
                           style="margin:0;font-size:15px;line-height:1.85;color:${B.dark};font-family:system-ui,-apple-system,sans-serif;">
                          ${nl2br(greeting)}
                        </p>
                      </td>
                    </tr>

                    <!-- Main body -->
                    <tr>
                      <td style="padding-bottom:24px;">
                        <p class="body-text dm-text"
                           style="margin:0;font-size:15px;line-height:1.9;color:${B.dark};font-family:system-ui,-apple-system,sans-serif;">
                          ${nl2br(body)}
                        </p>
                      </td>
                    </tr>

                    ${ctaBlock}
                    ${attachmentBlock}
                    ${closingBlock}

                  </table>

                </td>
              </tr>
            </table>
            <!-- /BODY -->

            <!-- ══ FOOTER ══ -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="footer-cell dm-footer-bg"
                    style="background:${B.footerBg};padding:20px 28px;border-radius:0 0 20px 20px;border-top:1px solid ${B.border};">

                  <!-- Logo + name row -->
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                    <tr>
                      <td style="padding-right:10px;vertical-align:middle;">
                        <img src="${B.logoUrl}"
                             alt="MIT"
                             width="30" height="30"
                             style="display:block;width:30px;height:30px;object-fit:contain;border-radius:7px;opacity:0.85;">
                      </td>
                      <td style="vertical-align:middle;">
                        <p class="footer-text dm-text"
                           style="margin:0;font-size:13px;font-weight:700;color:${B.dark};font-family:system-ui,-apple-system,sans-serif;">
                          Make It Tech
                        </p>
                        <p class="footer-text dm-footer-subdesc"
                           style="margin:2px 0 0;font-size:11px;color:${B.muted};font-family:system-ui,-apple-system,sans-serif;">
                          新潟のDX支援・Web制作
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Button-style links row -->
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                    <tr>
                      <td style="padding-right:8px;">
                        <a href="${B.siteUrl}"
                           target="_blank" rel="noopener noreferrer"
                           class="dm-footer-link-accent"
                           style="display:inline-block;padding:6px 14px;border-radius:999px;background:${B.accentLight};color:${B.accent};font-size:12px;font-weight:700;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;border:1px solid #F5C9B8;white-space:nowrap;">
                          🌐 公式サイト
                        </a>
                      </td>
                      <td>
                        <a href="${B.contactUrl}"
                           target="_blank" rel="noopener noreferrer"
                           class="dm-footer-link-btn"
                           style="display:inline-block;padding:6px 14px;border-radius:999px;background:${B.white};color:${B.muted};font-size:12px;font-weight:600;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;border:1px solid ${B.border};white-space:nowrap;">
                          ✉ お問い合わせ
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Send date note -->
                  <p class="footer-text dm-footer-note"
                     style="margin:0;font-size:11px;color:#9CA3AF;font-family:system-ui,-apple-system,sans-serif;">
                    ${now} 送信 &nbsp;·&nbsp; このメールは Make It Tech より送信されました。
                  </p>

                </td>
              </tr>
            </table>
            <!-- /FOOTER -->

          </td>
        </tr>
      </table>
      <!-- /Card -->

    </td>
  </tr>
</table>

</body>
</html>`;
}

// ── Plain text fallback ───────────────────────────────────────────────────────

export function buildEmailText(params: EmailTemplateParams): string {
  const { toName, toEmail, type, greeting, body, ctaButtons, closing, attachmentCount } = params;
  const displayName = toName.trim() || toEmail || "";
  const typeLabel = TYPE_LABELS[type];

  const lines: string[] = [
    `Make It Tech — ${typeLabel}`,
    "=".repeat(40),
    "",
    displayName ? `${displayName} 様` : "",
    "",
    greeting,
    "",
    body,
  ];

  if (ctaButtons && ctaButtons.length > 0) {
    lines.push("");
    for (const btn of ctaButtons) {
      lines.push(`▶ ${btn.label}`, btn.url);
    }
  }

  if (attachmentCount && attachmentCount > 0) {
    lines.push("", `📎 添付ファイルが ${attachmentCount} 件あります。`);
  }

  if (closing) {
    lines.push("", closing);
  }

  lines.push(
    "",
    "─".repeat(40),
    "Make It Tech",
    "新潟のDX支援・Web制作",
    B.siteUrl
  );

  return lines.join("\n");
}
