import { supabase } from '@/lib/supabase';

export interface MoodTrack {
  id: string;
  name: string;
  imageUrl: string | null;
  externalUrl: string | null;
  previewUrl: string | null;
}

// Calls the `mood-track` Supabase Edge Function (supabase/functions/mood-track),
// which searches Deezer. No secrets needed on either side — Deezer's public
// search endpoint doesn't require an API key, unlike Spotify (which now
// requires the developer account to have an active Premium subscription
// just to call the Web API).
export async function fetchMoodTrack(mood: string): Promise<MoodTrack> {
  const { data, error } = await supabase.functions.invoke<MoodTrack>('mood-track', {
    body: { mood },
  });
  if (error) throw error;
  if (!data) throw new Error('음악 추천을 받지 못했어요.');
  return data;
}
