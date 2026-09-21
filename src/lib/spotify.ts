import { supabase } from '@/lib/supabase';

export interface MoodPlaylist {
  id: string;
  name: string;
  imageUrl: string | null;
  externalUrl: string | null;
}

// Calls the `spotify-mood-playlist` Supabase Edge Function
// (supabase/functions/spotify-mood-playlist) so the Spotify client secret
// never ships inside the app bundle.
export async function fetchMoodPlaylist(mood: string): Promise<MoodPlaylist> {
  const { data, error } = await supabase.functions.invoke<MoodPlaylist>('spotify-mood-playlist', {
    body: { mood },
  });
  if (error) throw error;
  if (!data) throw new Error('스포티파이 추천을 받지 못했어요.');
  return data;
}
