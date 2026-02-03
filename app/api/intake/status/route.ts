import { z } from "zod";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "reviewing", "in_progress", "contracted", "closed"]),
  contractEndAt: z.string().optional(),
});

function addMonths(date: Date, months: number) {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  const session = await verifyAdminSessionCookie(cookie);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid payload.", details: error instanceof Error ? error.message : undefined },
      { status: 400 }
    );
  }

  let contractEndDate: Date | undefined;
  if (payload.contractEndAt) {
    const parsed = new Date(payload.contractEndAt);
    if (Number.isNaN(parsed.getTime())) {
      return Response.json({ error: "Invalid contract end date." }, { status: 400 });
    }
    contractEndDate = parsed;
  }

  const { firestore } = getFirebaseAdmin();
  const docRef = firestore.collection("intakeResponses").doc(payload.id);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const data = snapshot.data() ?? {};
  const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
  const baseDate =
    payload.status === "contracted" && contractEndDate
      ? contractEndDate
      : createdAt;
  const expiresAt = Timestamp.fromDate(addMonths(baseDate, 2));

  await docRef.set(
    {
      status: payload.status,
      updatedAt: Timestamp.now(),
      expiresAt,
      contractEndAt:
        payload.status === "contracted" && contractEndDate
          ? Timestamp.fromDate(contractEndDate)
          : FieldValue.delete(),
    },
    { merge: true }
  );

  revalidateTag("admin-intake-list", { expire: 0 });
  revalidateTag("admin-intake-detail", { expire: 0 });
  revalidateTag(`admin-intake-detail:${payload.id}`, { expire: 0 });

  return Response.json({
    ok: true,
    id: payload.id,
    status: payload.status,
    expiresAt: expiresAt.toDate().toISOString(),
  });
}
