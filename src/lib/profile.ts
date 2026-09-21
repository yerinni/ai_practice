import { supabase } from '@/lib/supabase';
import type { Profile, Trip } from '@/types/database';

// Creates the profiles row on first login. Safe to call on every sign-in —
// `ignoreDuplicates` means it's a no-op once the row already exists.
export async function ensureProfile(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).limit(1);
  if (error) throw error;
  return (data?.[0] as Profile | undefined) ?? null;
}

export async function updateProfile(userId: string, patch: Partial<Profile>): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

export async function insertTrip(trip: Omit<Trip, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('trips').insert(trip);
  if (error) throw error;
}

export async function getActiveTrip(userId: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data?.[0] as Trip | undefined) ?? null;
}
