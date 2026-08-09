"use server";

import { cookies } from "next/headers";
import { STAMP_COOKIE } from "../../_lib/stamp";

/**
 * デモの回数を0に戻す。
 * 商談で繰り返し見せられるようにするためのもので、実運用では用意しない。
 */
export async function resetStamp() {
  const store = await cookies();
  store.delete(STAMP_COOKIE);
}
