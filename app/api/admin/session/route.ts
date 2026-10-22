import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return Response.json({ error: "ログアウトに失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
