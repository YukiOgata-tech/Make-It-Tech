import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_EXPIRES_MS,
  getAllowedAdminEmails,
} from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const schema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: Request) {
  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    return Response.json(
      { error: "Invalid payload.", details: error instanceof Error ? error.message : undefined },
      { status: 400 }
    );
  }

  const { auth, firestore } = getFirebaseAdmin();
  try {
    const decoded = await auth.verifyIdToken(payload.idToken);
    const email = decoded.email?.toLowerCase() ?? "";
    const uid = decoded.uid;

    if (uid) {
      const adminDoc = await firestore.collection("adminUsers").doc(uid).get();
      if (adminDoc.exists) {
        const data = adminDoc.data() ?? {};
        if (data.enabled !== true) {
          return Response.json({ error: "Unauthorized." }, { status: 401 });
        }
      } else {
        const allowed = getAllowedAdminEmails();
        if (!email || !allowed.includes(email)) {
          return Response.json({ error: "Unauthorized." }, { status: 401 });
        }

        const now = Timestamp.now();
        await firestore.collection("adminUsers").doc(uid).set({
          email,
          enabled: true,
          role: "admin",
          createdAt: now,
          updatedAt: now,
        });
      }
    } else {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const sessionCookie = await auth.createSessionCookie(payload.idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_MS / 1000,
    });
    return response;
  } catch (error) {
    return Response.json(
      { error: "Unauthorized.", details: error instanceof Error ? error.message : undefined },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
