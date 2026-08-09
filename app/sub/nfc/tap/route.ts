import { NextResponse, type NextRequest } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { nfcSite } from "@/content/nfc/site";
import {
  STAMP_COOKIE,
  STAMP_MAX_AGE,
  advanceStamp,
  parseStamp,
  serializeStamp,
} from "../_lib/stamp";

/**
 * NFCタグに書き込む入口。かざされるたびに回数を1つ進めて /card へ送る。
 *
 * 表示は /card が担当し、ここは数えるだけ。分けているのは、Cookie を
 * 書き込めるのが Route Handler / Server Action / proxy に限られるためと、
 * /card を直接開いたりリロードしたりしても回数が増えないようにするため。
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATS_DOC = "mit-card";

/** 集計は「計測もできる」ことを見せるためのもの。失敗してもデモは動かす。 */
async function recordStats(isNewDevice: boolean) {
  try {
    const { firestore } = getFirebaseAdmin();
    await firestore
      .collection("nfcDemoStats")
      .doc(STATS_DOC)
      .set(
        {
          totalTaps: FieldValue.increment(1),
          uniqueDevices: FieldValue.increment(isNewDevice ? 1 : 0),
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
  } catch {
    // 集計が落ちても体験は止めない
  }
}

export async function GET(request: NextRequest) {
  const current = parseStamp(request.cookies.get(STAMP_COOKIE)?.value);
  const { next, isNewDevice } = advanceStamp(current);

  await recordStats(isNewDevice);

  // 本番（nfc.make-it-tech.com）ではリライト前のパスで返し、
  // ローカルなど別ホストでは /sub/nfc を付けたパスで返す
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const cardPath =
    host === nfcSite.host ? "/card" : `${nfcSite.basePath}/card`;

  const response = NextResponse.redirect(new URL(cardPath, request.nextUrl.origin), {
    // かざすたびに評価させるため、リダイレクト自体をキャッシュさせない
    status: 303,
  });

  response.cookies.set({
    name: STAMP_COOKIE,
    value: serializeStamp(next),
    maxAge: STAMP_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}
