// Browser-safe Supabase client
const { createClient } = supabase;

const SUPABASE_URL = 'https://fyyyglkgtmrvwokmqzos.supabase.co';
const SUPABASE_ANON_KEY = ''; // Add from dashboard → Settings → API

window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase ready:', window.supabase);
