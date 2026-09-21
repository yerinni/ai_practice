import { supabase } from '@/lib/supabase';
import type { SavedItem } from '@/types/database';

export async function saveItem(item: Omit<SavedItem, 'id' | 'saved_at'>): Promise<void> {
  const { error } = await supabase.from('saved_items').insert(item);
  if (error) throw error;
}
