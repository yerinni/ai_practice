-- Initial schema for the solo-traveler companion app.
-- Mirrors docs/db-schema.md — keep both in sync when this changes.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_first_trip boolean not null default true,
  safety_checklist_skipped boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "본인 프로필만 조회/수정"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  destination text not null,
  start_date date not null,
  end_date date not null,
  music_genres text[] not null default '{}',
  mood_preferences text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index on public.trips (user_id, is_active);

alter table public.trips enable row level security;

create policy "본인 여행만 조회/수정"
  on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.spotify_connections (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  spotify_user_id text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  connected_at timestamptz not null default now()
);

alter table public.spotify_connections enable row level security;
-- No policy: client access is intentionally blocked. Only the service-role
-- key (used from an Edge Function) can read/write this table.

create type mood_action as enum ('suggested', 'played', 'completed', 'changed');

create table public.mood_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  latitude double precision,
  longitude double precision,
  time_of_day text,
  mood_tag text not null,
  spotify_playlist_id text,
  action mood_action not null default 'suggested',
  created_at timestamptz not null default now()
);

create index on public.mood_recommendations (user_id, created_at desc);

alter table public.mood_recommendations enable row level security;

create policy "본인 추천 기록만 조회/작성"
  on public.mood_recommendations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.place_cache (
  id uuid primary key default gen_random_uuid(),
  geohash text not null,
  category text not null,
  places_json jsonb not null,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create unique index on public.place_cache (geohash, category);

alter table public.place_cache enable row level security;

create policy "누구나 캐시 조회 가능"
  on public.place_cache for select
  using (true);
-- Writes only happen from the nearby-places Edge Function's service-role key.

create type saved_item_type as enum ('music', 'place');

create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  item_type saved_item_type not null,
  reference_id text not null,
  title text not null,
  image_url text,
  metadata jsonb not null default '{}',
  saved_at timestamptz not null default now()
);

create index on public.saved_items (user_id, saved_at desc);

alter table public.saved_items enable row level security;

create policy "본인 저장함만 조회/작성/삭제"
  on public.saved_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_label text not null,
  body text not null,
  tags text[] not null default '{}',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "게시된 후기는 누구나 조회 가능"
  on public.testimonials for select
  using (published = true);

create table public.safety_checklist_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sort_order int not null default 0,
  active boolean not null default true
);

alter table public.safety_checklist_items enable row level security;

create policy "활성화된 체크리스트는 누구나 조회 가능"
  on public.safety_checklist_items for select
  using (active = true);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index on public.events (user_id, event_type, created_at desc);

alter table public.events enable row level security;

create policy "본인 이벤트만 작성 가능"
  on public.events for insert
  with check (auth.uid() = user_id);
