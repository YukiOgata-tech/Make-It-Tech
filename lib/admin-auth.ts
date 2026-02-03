import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const SESSION_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

export function getAllowedAdminEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function verifyAdminSessionCookie(cookieValue: string) {
  if (!cookieValue) return null;
  const { auth, firestore } = getFirebaseAdmin();
  try {
    const decoded = await auth.verifySessionCookie(cookieValue, true);
    const email = decoded.email?.toLowerCase() ?? "";
    const uid = decoded.uid;

    if (uid) {
      try {
        const adminDoc = await firestore.collection("adminUsers").doc(uid).get();
        if (adminDoc.exists) {
          const data = adminDoc.data() ?? {};
          if (data.enabled === true) {
            return decoded;
          }
        }
      } catch {
        return null;
      }
    }

    const allowed = getAllowedAdminEmails();
    if (allowed.length && email && allowed.includes(email)) {
      if (uid) {
        const now = Timestamp.now();
        try {
          await firestore.collection("adminUsers").doc(uid).set(
            {
              email,
              enabled: true,
              role: "admin",
              createdAt: now,
              updatedAt: now,
            },
            { merge: true }
          );
        } catch {
          return null;
        }
      }
      return decoded;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  return verifyAdminSessionCookie(cookie);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
