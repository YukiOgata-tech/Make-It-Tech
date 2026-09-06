import { acceptContractSchema } from "@/lib/contracts/schemas";
import { completeContractSigning } from "@/lib/contracts/server";
import { getRequestEvidence, isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { sha256 } from "@/lib/contracts/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RateEntry = { count: number; resetAt: number };
const globalRate = globalThis as typeof globalThis & { contractAcceptRate?: Map<string, RateEntry> };
const rateMap = globalRate.contractAcceptRate ?? new Map<string, RateEntry>();
globalRate.contractAcceptRate = rateMap;

function isRateLimited(key: string) {
  const now = Date.now();
  const current = rateMap.get(key);
  if (!current || current.resetAt <= now) {
    rateMap.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 8;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!isAllowedSameOriginRequest(request)) {
    return Response.json({ error: "不正な送信元です。" }, { status: 403 });
  }
  const { token } = await params;
  const evidence = getRequestEvidence(request);
  if (isRateLimited(`${evidence.ipAddress}:${sha256(token)}`)) {
    return Response.json({ error: "操作回数が多すぎます。しばらく待ってから再試行してください。" }, { status: 429 });
  }
  const parsed = acceptContractSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ error: "すべての確認項目への同意が必要です。" }, { status: 400 });
  }
  try {
    const contract = await completeContractSigning(token, evidence);
    return Response.json({ ok: true, contract });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "契約を締結できませんでした。" },
      { status: 409 }
    );
  }
}
