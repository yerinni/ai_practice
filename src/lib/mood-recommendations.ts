import { supabase } from '@/lib/supabase';
import type { MoodAction } from '@/types/database';

// `spotifyPlaylistId` / `spotify_playlist_id` predate the switch from
// Spotify to Deezer (see git history) and now hold a Deezer track id.
// Kept the original column/field name to avoid another migration for a
// naming detail — revisit if this schema gets a real rename pass.
export async function insertMoodRecommendation(payload: {
  userId: string;
  tripId: string | null;
  latitude: number | null;
  longitude: number | null;
  timeOfDay: string;
  moodTag: string;
  spotifyPlaylistId: string | null;
}): Promise<string> {
  const { data, error } = await supabase
    .from('mood_recommendations')
    .insert({
      user_id: payload.userId,
      trip_id: payload.tripId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      time_of_day: payload.timeOfDay,
      mood_tag: payload.moodTag,
      spotify_playlist_id: payload.spotifyPlaylistId,
      action: 'suggested',
    })
    .select('id')
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateMoodRecommendationAction(id: string, action: MoodAction): Promise<void> {
  const { error } = await supabase.from('mood_recommendations').update({ action }).eq('id', id);
  if (error) throw error;
}
