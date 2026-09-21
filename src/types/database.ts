// Mirrors docs/db-schema.md. Keep these in sync with the actual Supabase migrations.

export type MoodAction = 'suggested' | 'played' | 'completed' | 'changed';
export type SavedItemType = 'music' | 'place';

export interface Profile {
  id: string;
  display_name: string | null;
  is_first_trip: boolean;
  safety_checklist_skipped: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  music_genres: string[];
  mood_preferences: string[];
  is_active: boolean;
  created_at: string;
}

export interface SpotifyConnection {
  user_id: string;
  spotify_user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  connected_at: string;
}

export interface MoodRecommendation {
  id: string;
  user_id: string;
  trip_id: string | null;
  latitude: number | null;
  longitude: number | null;
  time_of_day: string | null;
  mood_tag: string;
  spotify_playlist_id: string | null;
  action: MoodAction;
  created_at: string;
}

export interface PlaceCache {
  id: string;
  geohash: string;
  category: string;
  places_json: unknown;
  fetched_at: string;
  expires_at: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  trip_id: string | null;
  item_type: SavedItemType;
  reference_id: string;
  title: string;
  image_url: string | null;
  metadata: Record<string, unknown>;
  saved_at: string;
}

export interface Testimonial {
  id: string;
  author_label: string;
  body: string;
  tags: string[];
  published: boolean;
  sort_order: number;
  created_at: string;
}

export interface SafetyChecklistItem {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  active: boolean;
}

export interface AppEvent {
  id: string;
  user_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// These interfaces are hand-written from docs/db-schema.md for use with
// `.returns<T>()` at each call site (see src/lib/supabase.ts for why the
// client itself isn't given a `Database` generic). Replace with `supabase
// gen types` output once the schema is applied to a real project.
