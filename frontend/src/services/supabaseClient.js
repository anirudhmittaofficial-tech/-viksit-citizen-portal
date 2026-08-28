import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey.includes('PASTE_YOUR_FULL')) {
  console.warn('⚠️ Supabase URL or Publishable Key is missing from frontend/.env');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey && !supabaseKey.includes('PASTE_YOUR_FULL') ? supabaseKey : 'placeholder'
);
