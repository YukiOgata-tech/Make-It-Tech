import "server-only";

import { createRequestId } from "@/lib/contracts/crypto";
export { isAllowedSameOriginRequest } from "@/lib/contracts/origin";

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}

export function getRequestEvidence(request: Request) {
  return {
    ipAddress:
      firstHeaderValue(request.headers.get("x-forwarded-for")) ||
      firstHeaderValue(request.headers.get("x-real-ip")),
    userAgent: (request.headers.get("user-agent") ?? "").slice(0, 1000),
    requestId: request.headers.get("x-request-id")?.slice(0, 200) || createRequestId(),
  };
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}
