import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables."
  );
}

/**
 * Public Supabase client (uses anon key).
 * For authenticated operations, the user's session token is automatically
 * attached after calling supabase.auth.signInWithPassword().
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
