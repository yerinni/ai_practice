import { supabase } from '@/lib/supabase';
import type { SavedItem, SavedItemType } from '@/types/database';

export async function saveItem(item: Omit<SavedItem, 'id' | 'saved_at'>): Promise<void> {
  const { error } = await supabase.from('saved_items').insert(item);
  if (error) throw error;
}

export async function listSavedItems(userId: string, itemType?: SavedItemType): Promise<SavedItem[]> {
  let query = supabase.from('saved_items').select('*').eq('user_id', userId).order('saved_at', { ascending: false });
  if (itemType) query = query.eq('item_type', itemType);
  const { data, error } = await query;
  if (error) throw error;
  return (data as SavedItem[] | null) ?? [];
}

export async function deleteSavedItem(id: string): Promise<void> {
  const { error } = await supabase.from('saved_items').delete().eq('id', id);
  if (error) throw error;
}
