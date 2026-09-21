import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values.',
  );
}

// No <Database> generic here: hand-writing the full generated-types shape
// (Row/Insert/Update/Relationships per table) fights supabase-js's inference
// more than it helps. Call sites use `.returns<T>()` with the interfaces in
// `@/types/database` instead; swap this for `supabase gen types` output once
// the schema is applied to a real project.
//
// AsyncStorage (not expo-secure-store): Supabase sessions store an access + refresh token pair
// that can exceed SecureStore's ~2KB per-key limit, so the official Supabase RN guide uses AsyncStorage.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
