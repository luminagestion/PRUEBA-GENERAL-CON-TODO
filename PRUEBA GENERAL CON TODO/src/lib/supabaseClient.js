import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("TEST Supabase ENV:", {
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? "OK" : "MISSING",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Faltan variables de entorno de Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
