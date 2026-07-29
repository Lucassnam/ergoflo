import "server-only";
import { createClient } from "@supabase/supabase-js";

/* ============================================================
   SUPABASE — server-only client for the /notify email list.

   THINGS TO SWAP BEFORE LAUNCH:
     SUPABASE_URL, SUPABASE_SECRET_KEY — set in .env.local (see
     .env.local.example). Never expose SUPABASE_SECRET_KEY to the browser —
     it bypasses row-level security.
   ============================================================ */

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export const isSupabaseConfigured = Boolean(url && secretKey);

/** Returns null if env vars aren't set yet, so callers fail loud instead of throwing. */
export function getSupabaseAdmin() {
  if (!url || !secretKey) return null;
  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}
