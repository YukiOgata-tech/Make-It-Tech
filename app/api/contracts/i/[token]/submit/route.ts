import { getRequestEvidence, isAllowedSameOriginRequest } from "@/lib/contracts/http";
import { submitContractInputRequest } from "@/lib/contracts/input-requests.server";
import { sha256 } from "@/lib/contracts/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RateEntry = { count: number; resetAt: number };
const globalRate = globalThis as typeof globalThis & {
  contractInputRate?: Map<string, RateEntry>;
};
const rateMap = globalRate.contractInputRate ?? new Map<string, RateEntry>();
globalRate.contractInputRate = rateMap;

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
    return Response.json(
      { error: "操作回数が多すぎます。しばらく待ってから再試行してください。" },
      { status: 429 }
    );
  }
  try {
    await submitContractInputRequest(
      token,
      await request.json().catch(() => ({})),
      evidence
    );
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "入力内容を送信できませんでした。" },
      { status: 409 }
    );
  }
}
