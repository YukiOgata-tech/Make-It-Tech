import "server-only";

import { siteDocumentStore } from "@/lib/supabase/site-documents";

// The document adapter preserves the existing Firestore-shaped call sites,
// but all reads and writes use Supabase. No Firebase app is initialized.
export function getSiteDataStore() {
  return { firestore: siteDocumentStore as unknown as FirebaseFirestore.Firestore };
}
