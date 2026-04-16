export type EmailType = "reply" | "sales" | "custom";

export interface EmailTemplateParams {
  toName: string;
  type: EmailType;
  greeting: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  closing?: string;
}

const BRAND = {
  accent: "#E2673D",
  accentLight: "#FDF0EB",
  dark: "#1C2C34",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F4F5F7",
  white: "#FFFFFF",
  panel: "#F8FAFC",
  siteUrl: "https://make-it-tech.com",
  logoUrl: "https://make-it-tech.com/images/logo-02_MIT-normal.png",
  contactUrl: "https://make-it-tech.com/contact",
} as const;

const TYPE_LABELS: Record<EmailType, string> = {
  reply: "お問い合わせ返信",
  sales: "ご提案",
  custom: "お知らせ",
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** body テキストの改行を <br> + html エスケープに変換 */
function nl2br(str: string) {
  return escapeHtml(str).replace(/\n/g, "<br>");
}

export function buildEmailHtml(params: EmailTemplateParams): string {
  const { toName, type, greeting, body, ctaLabel, ctaUrl, closing } = params;
  const typeLabel = TYPE_LABELS[type];
  const now = new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const safeToName = escapeHtml(toName);
  const safeGreeting = nl2br(greeting);
  const safeBody = nl2br(body);
  const safeClosing = closing ? nl2br(closing) : null;
  const safeCtaLabel = ctaLabel ? escapeHtml(ctaLabel) : null;
  const safeCtaUrl = ctaUrl ? escapeHtml(ctaUrl) : null;

  const ctaBlock =
    safeCtaLabel && safeCtaUrl
      ? `
    <!-- CTA Button -->
    <tr>
      <td align="center" style="padding: 8px 0 24px;">
        <a href="${safeCtaUrl}"
           target="_blank"
           rel="noopener noreferrer"
           style="display:inline-block; padding:14px 32px; background:${BRAND.accent}; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; border-radius:12px; letter-spacing:0.02em;">
          ${safeCtaLabel}
        </a>
      </td>
    </tr>`
      : "";

  const closingBlock = safeClosing
    ? `
    <!-- Closing -->
    <tr>
      <td style="padding:8px 0 24px; font-size:14px; line-height:1.85; color:${BRAND.dark};">
        ${safeClosing}
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
  @media only screen and (max-width:600px){
    .email-outer{padding:12px 0!important;}
    .email-card{border-radius:12px!important;padding:20px 16px!important;}
    .email-header{padding:0 0 16px!important;}
    .logo-img{width:36px!important;height:36px!important;}
    .brand-name{font-size:16px!important;}
    .type-badge{font-size:11px!important;padding:4px 10px!important;}
    .greeting{font-size:15px!important;}
    .body-text{font-size:14px!important;}
    .cta-btn{padding:12px 24px!important;font-size:14px!important;}
    .footer-cell{padding:16px 0 0!important;}
    .footer-text{font-size:11px!important;}
    .divider-top{width:32px!important;height:3px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};-webkit-font-smoothing:antialiased;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background:${BRAND.bg};padding:32px 0;"
       class="email-outer">
  <tr>
    <td align="center">

      <!-- Card -->
      <table role="presentation" cellpadding="0" cellspacing="0"
             style="width:100%;max-width:600px;">
        <tr>
          <td class="email-card"
              style="background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:20px;padding:32px;overflow:hidden;">

            <!-- Top accent bar -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="margin-bottom:24px;">
              <tr>
                <td>
                  <div class="divider-top"
                       style="width:40px;height:4px;background:${BRAND.accent};border-radius:4px;"></div>
                </td>
              </tr>
            </table>

            <!-- Header: Logo + Brand -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   class="email-header" style="padding-bottom:20px;">
              <tr>
                <td style="vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:10px;">
                        <img src="${BRAND.logoUrl}"
                             alt="Make It Tech ロゴ"
                             width="40" height="40"
                             class="logo-img"
                             style="display:block;width:40px;height:40px;object-fit:contain;border-radius:8px;">
                      </td>
                      <td style="vertical-align:middle;">
                        <span class="brand-name"
                              style="font-size:18px;font-weight:700;color:${BRAND.dark};letter-spacing:-0.01em;font-family:system-ui,-apple-system,sans-serif;">
                          Make It Tech
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span class="type-badge"
                        style="display:inline-block;padding:5px 14px;border-radius:999px;background:${BRAND.accentLight};color:${BRAND.accent};font-size:12px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;white-space:nowrap;">
                    ${typeLabel}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="margin-bottom:24px;">
              <tr>
                <td style="border-top:1px solid ${BRAND.border};"></td>
              </tr>
            </table>

            <!-- Body Content -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

              <!-- Salutation -->
              <tr>
                <td style="padding-bottom:20px;font-family:system-ui,-apple-system,sans-serif;">
                  <span class="greeting"
                        style="font-size:16px;font-weight:600;color:${BRAND.dark};line-height:1.6;">
                    ${safeToName ? `${safeToName} 様` : ""}
                  </span>
                </td>
              </tr>

              <!-- Greeting paragraph -->
              <tr>
                <td style="padding-bottom:20px;">
                  <p class="body-text"
                     style="margin:0;font-size:15px;line-height:1.85;color:${BRAND.dark};font-family:system-ui,-apple-system,sans-serif;">
                    ${safeGreeting}
                  </p>
                </td>
              </tr>

              <!-- Main body -->
              <tr>
                <td style="padding-bottom:24px;">
                  <div style="background:${BRAND.panel};border:1px solid ${BRAND.border};border-left:4px solid ${BRAND.accent};border-radius:0 12px 12px 0;padding:16px 20px;">
                    <p class="body-text"
                       style="margin:0;font-size:15px;line-height:1.9;color:${BRAND.dark};font-family:system-ui,-apple-system,sans-serif;">
                      ${safeBody}
                    </p>
                  </div>
                </td>
              </tr>

              ${ctaBlock}

              ${closingBlock}

            </table>

            <!-- Divider -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="margin-bottom:24px;">
              <tr>
                <td style="border-top:1px solid ${BRAND.border};"></td>
              </tr>
            </table>

            <!-- Footer -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   class="footer-cell">
              <tr>
                <td>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:10px;vertical-align:middle;">
                        <img src="${BRAND.logoUrl}"
                             alt="MIT"
                             width="28" height="28"
                             style="display:block;width:28px;height:28px;object-fit:contain;border-radius:6px;opacity:0.75;">
                      </td>
                      <td style="vertical-align:middle;">
                        <p class="footer-text"
                           style="margin:0;font-size:13px;font-weight:700;color:${BRAND.dark};font-family:system-ui,-apple-system,sans-serif;">
                          Make It Tech
                        </p>
                        <p class="footer-text"
                           style="margin:2px 0 0;font-size:11px;color:${BRAND.muted};font-family:system-ui,-apple-system,sans-serif;">
                          新潟のDX支援・Web制作
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                         style="margin-top:12px;">
                    <tr>
                      <td>
                        <p class="footer-text"
                           style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.7;font-family:system-ui,-apple-system,sans-serif;">
                          <a href="${BRAND.siteUrl}" target="_blank" rel="noopener noreferrer"
                             style="color:${BRAND.accent};text-decoration:none;">${BRAND.siteUrl}</a>
                          &nbsp;|&nbsp;
                          <a href="${BRAND.contactUrl}" target="_blank" rel="noopener noreferrer"
                             style="color:${BRAND.muted};text-decoration:none;">お問い合わせ</a>
                        </p>
                        <p class="footer-text"
                           style="margin:6px 0 0;font-size:11px;color:#9CA3AF;font-family:system-ui,-apple-system,sans-serif;">
                          ${now} 送信 &nbsp;·&nbsp; このメールはMake It Techより送信されました。
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

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

export function buildEmailText(params: EmailTemplateParams): string {
  const { toName, type, greeting, body, ctaLabel, ctaUrl, closing } = params;
  const typeLabel = TYPE_LABELS[type];

  const lines = [
    `Make It Tech — ${typeLabel}`,
    "=".repeat(40),
    "",
    toName ? `${toName} 様` : "",
    "",
    greeting,
    "",
    body,
  ];

  if (ctaLabel && ctaUrl) {
    lines.push("", `▶ ${ctaLabel}`, ctaUrl);
  }

  if (closing) {
    lines.push("", closing);
  }

  lines.push(
    "",
    "─".repeat(40),
    "Make It Tech",
    "新潟のDX支援・Web制作",
    BRAND.siteUrl
  );

  return lines.filter((l) => l !== undefined).join("\n");
}
