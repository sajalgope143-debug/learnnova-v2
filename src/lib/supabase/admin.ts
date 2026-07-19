import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. BYPASSES Row Level Security entirely.
 *
 * Use ONLY for trusted server-side operations that must act outside a
 * single user's permissions, e.g.:
 *  - Creating an enrollment after verified payment webhook
 *  - Crediting referral commissions
 *  - Admin panel bulk operations (after verifying requester is admin)
 *
 * NEVER import this file into any Client Component or expose the
 * underlying key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
