// ============================================================
// Supabase client — solo para suscripciones Realtime.
// El frontend NO usa este cliente para leer/escribir datos.
// Eso sigue siendo responsabilidad exclusiva de n8n.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: { timeout: 30000 },
    auth: { persistSession: false },
});
