import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  // Fail loudly at boot rather than silently returning empty data later.
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy server/.env.example to server/.env and fill it in."
  );
}

// Server-side client uses the service role key, which bypasses Row Level
// Security. That's intentional here: this API *is* the trust boundary
// (there's no per-user auth in this app), so every route below is
// responsible for deciding what a caller is allowed to see or change.
export const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
