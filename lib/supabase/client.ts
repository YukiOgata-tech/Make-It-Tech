import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, publishableKey } = getSupabaseConfig();
  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
