import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eefgoogiwzcglrioenvo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5LbXxpFBeBdIkwvZTAeBiw_X9e-ExW0';

export const supabase = createClient(supabaseUrl, supabaseKey);
