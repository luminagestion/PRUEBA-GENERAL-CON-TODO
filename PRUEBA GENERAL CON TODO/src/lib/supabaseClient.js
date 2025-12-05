import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY LENGTH:", supabaseAnonKey ? supabaseAnonKey.length : 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan variables de entorno de Supabase", {
    supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
