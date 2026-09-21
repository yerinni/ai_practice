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

// Minimal Supabase Database generic so `createClient<Database>()` gets basic type safety
// without hand-writing the full generated-types shape. Replace with `supabase gen types`
// output once the schema is applied to a real project.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      trips: { Row: Trip; Insert: Omit<Trip, 'id' | 'created_at'> & Partial<Pick<Trip, 'id'>>; Update: Partial<Trip> };
      spotify_connections: {
        Row: SpotifyConnection;
        Insert: SpotifyConnection;
        Update: Partial<SpotifyConnection>;
      };
      mood_recommendations: {
        Row: MoodRecommendation;
        Insert: Omit<MoodRecommendation, 'id' | 'created_at'> & Partial<Pick<MoodRecommendation, 'id'>>;
        Update: Partial<MoodRecommendation>;
      };
      place_cache: {
        Row: PlaceCache;
        Insert: Omit<PlaceCache, 'id'> & Partial<Pick<PlaceCache, 'id'>>;
        Update: Partial<PlaceCache>;
      };
      saved_items: {
        Row: SavedItem;
        Insert: Omit<SavedItem, 'id' | 'saved_at'> & Partial<Pick<SavedItem, 'id'>>;
        Update: Partial<SavedItem>;
      };
      testimonials: { Row: Testimonial; Insert: Partial<Testimonial>; Update: Partial<Testimonial> };
      safety_checklist_items: {
        Row: SafetyChecklistItem;
        Insert: Partial<SafetyChecklistItem>;
        Update: Partial<SafetyChecklistItem>;
      };
      events: {
        Row: AppEvent;
        Insert: Omit<AppEvent, 'id' | 'created_at'> & Partial<Pick<AppEvent, 'id'>>;
        Update: Partial<AppEvent>;
      };
    };
  };
}
