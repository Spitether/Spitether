import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://fyyyglkgtmrvwokmqzos.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error("Add SUPABASE_ANON_KEY & SERVICE_ROLE_KEY to .env");
}

export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});
