import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for missing environment variables
const isMissingEnvVars = !supabaseUrl || !supabaseAnonKey;

if (isMissingEnvVars) {
    console.error(
        '⚠️ Supabase environment variables are not configured.\n' +
        'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in:\n' +
        '- Local: .env.local file\n' +
        '- Vercel: Project Settings > Environment Variables'
    );
}

// Create a client even if env vars are missing (will fail on actual API calls)
// This prevents the app from crashing on load
export const supabase: SupabaseClient<Database> = isMissingEnvVars
    ? createClient<Database>('https://placeholder.supabase.co', 'placeholder_key')
    : createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    });

export const isSupabaseConfigured = !isMissingEnvVars;
