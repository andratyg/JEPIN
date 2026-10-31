import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://aaqlhziivdbvjewobyyh.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_n_httt3K-rKcnTKHXy7uGg_6rSZKa0q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    detectSessionInUrl: typeof window !== "undefined",
  },
});
