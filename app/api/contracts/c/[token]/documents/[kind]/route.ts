import { getPublicContractDocument } from "@/lib/contracts/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const kinds = ["original", "executed", "certificate"] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; kind: string }> }
) {
  const { token, kind } = await params;
  if (!kinds.includes(kind as (typeof kinds)[number])) {
    return Response.json({ error: "Document not found." }, { status: 404 });
  }
  const result = await getPublicContractDocument(token, kind as (typeof kinds)[number]);
  if (!result) return Response.json({ error: "Document not found." }, { status: 404 });
  const suffix = kind === "original" ? "original" : kind === "executed" ? "executed" : "certificate";
  return new Response(Buffer.from(result.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${result.contract.contractNumber}-${suffix}.pdf"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'",
    },
  });
}
