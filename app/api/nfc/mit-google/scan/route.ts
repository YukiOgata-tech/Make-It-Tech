import { randomUUID } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import {
  mitGoogleExperience,
  type MitGoogleScanResponse,
} from "@/content/nfc/mit-google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEVICE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getTimestampMillis(value: unknown) {
  return value instanceof Timestamp ? value.toMillis() : null;
}

function getScanCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

function createResponse(body: MitGoogleScanResponse, deviceId: string) {
  const response = NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });

  response.cookies.set({
    name: mitGoogleExperience.cookie.name,
    value: deviceId,
    maxAge: mitGoogleExperience.cookie.maxAgeSeconds,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "許可されていないリクエストです。" },
      {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const storedDeviceId = request.cookies.get(
    mitGoogleExperience.cookie.name
  )?.value;
  const deviceId =
    storedDeviceId && DEVICE_ID_PATTERN.test(storedDeviceId)
      ? storedDeviceId
      : randomUUID();

  try {
    const { firestore } = getFirebaseAdmin();
    const experienceRef = firestore
      .collection("nfcExperiences")
      .doc(mitGoogleExperience.id);
    const deviceRef = experienceRef.collection("devices").doc(deviceId);
    const unlockDelayMs = mitGoogleExperience.unlockDelaySeconds * 1000;

    const result = await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(deviceRef);
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + mitGoogleExperience.cookie.maxAgeSeconds * 1000
      );

      if (!snapshot.exists) {
        transaction.set(deviceRef, {
          anonymousDeviceId: deviceId,
          scanCount: 1,
          firstScannedAt: now,
          lastScannedAt: now,
          expiresAt,
        });
        transaction.set(
          experienceRef,
          {
            totalScans: FieldValue.increment(1),
            uniqueDevices: FieldValue.increment(1),
            updatedAt: now,
          },
          { merge: true }
        );

        return {
          state: "review" as const,
          scanCount: 1,
          reviewUrl: mitGoogleExperience.reviewUrl,
        };
      }

      const data = snapshot.data() ?? {};
      const scanCount = getScanCount(data.scanCount) + 1;
      const firstScannedAt = getTimestampMillis(data.firstScannedAt) ?? now.toMillis();
      const alreadyUnlocked = getTimestampMillis(data.couponUnlockedAt) !== null;
      const elapsedMs = Math.max(0, now.toMillis() - firstScannedAt);
      const couponUnlocked = alreadyUnlocked || elapsedMs >= unlockDelayMs;

      transaction.set(
        deviceRef,
        {
          scanCount,
          lastScannedAt: now,
          expiresAt,
          ...(couponUnlocked && !alreadyUnlocked ? { couponUnlockedAt: now } : {}),
        },
        { merge: true }
      );
      transaction.set(
        experienceRef,
        {
          totalScans: FieldValue.increment(1),
          uniqueDevices: FieldValue.increment(0),
          updatedAt: now,
        },
        { merge: true }
      );

      if (couponUnlocked) {
        return {
          state: "coupon" as const,
          scanCount,
          couponCode: mitGoogleExperience.couponCode,
        };
      }

      return {
        state: "waiting" as const,
        scanCount,
        remainingSeconds: Math.max(
          1,
          Math.ceil((unlockDelayMs - elapsedMs) / 1000)
        ),
        couponCode: mitGoogleExperience.couponCode,
      };
    });

    return createResponse(result, deviceId);
  } catch (error) {
    console.error("[nfc/mit-google] Failed to record scan", error);
    return NextResponse.json(
      { error: "スキャン情報を確認できませんでした。" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
