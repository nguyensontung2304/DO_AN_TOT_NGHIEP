import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Thiếu cấu hình Supabase trong file .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
