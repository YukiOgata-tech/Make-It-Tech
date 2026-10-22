import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type SupabaseCookieUpdate = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function refreshSupabaseSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  const cookieUpdates: SupabaseCookieUpdate[] = [];
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookieUpdates.push(...cookiesToSet);
      },
    },
  });

  await supabase.auth.getClaims();
  return cookieUpdates;
}
