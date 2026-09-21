# DB 스키마 설계 (Supabase / Postgres)

> PRD v3 기준. 인증은 Supabase Auth(`auth.users`)를 그대로 사용하고, 아래 테이블은 모두 `public` 스키마에 둔다.
> RLS(Row Level Security)는 기본적으로 "본인 데이터만 조회/수정 가능"을 원칙으로 하고, 콘텐츠성 테이블(후기, 안전 체크리스트, 장소 캐시)은 전체 공개 읽기로 둔다.

---

## 1. profiles — 사용자 기본 정보 (R-PROFILE, F2)

`auth.users`를 1:1 확장한다.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_first_trip boolean not null default true,       -- F2: 혼자 여행이 처음인가
  safety_checklist_skipped boolean not null default false, -- F8: 반복 사용자 스킵 여부
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "본인 프로필만 조회/수정"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

---

## 2. trips — 여행 프로필 (R-PROFILE, F1)

한 사용자가 여러 번 여행할 수 있으므로 별도 테이블로 분리. "현재 여행"은 `start_date <= now() <= end_date`로 판별하거나 `is_active` 플래그를 둔다.

```sql
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  destination text not null,
  start_date date not null,
  end_date date not null,
  music_genres text[] not null default '{}',      -- F1: 음악 취향(장르)
  mood_preferences text[] not null default '{}',  -- F1: 음악 취향(분위기)
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index on public.trips (user_id, is_active);

alter table public.trips enable row level security;

create policy "본인 여행만 조회/수정"
  on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## 3. spotify_connections — 스포티파이 OAuth 연동 (R-MOOD, F3/F4)

토큰은 반드시 서버(Edge Function, service role)에서만 읽고 쓰도록 하고, 클라이언트에는 노출하지 않는다.

```sql
create table public.spotify_connections (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  spotify_user_id text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  connected_at timestamptz not null default now()
);

alter table public.spotify_connections enable row level security;

-- 클라이언트 직접 접근 금지: 정책 없음 (service_role 키를 쓰는 Edge Function에서만 접근)
```

---

## 4. mood_recommendations — 무드 추천 로그 (R-MOOD, F3/F4 + 성공 지표)

추천 1건당 1행. "다른 느낌으로 바꾸기"(F4)를 누르면 이전 행은 `action='changed'`로 남기고 새 행을 추가한다. 성공 지표(일평균 상호작용, 재생 완료율, 클릭률) 계산의 기반 데이터가 된다.

```sql
create type mood_action as enum ('suggested', 'played', 'completed', 'changed');

create table public.mood_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  latitude double precision,
  longitude double precision,
  time_of_day text,                 -- 'morning' | 'afternoon' | 'evening' | 'night'
  mood_tag text not null,           -- 예: 'calm', 'energetic', 'nostalgic'
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
```

---

## 5. place_cache — 주변 활동 추천 캐시 (R-ACT, F5)

구글 플레이스 API 쿼터 절약을 위해 위치를 geohash 등으로 반올림해 캐싱한다. 사용자별이 아니라 위치+카테고리 기준으로 공유 캐시.

```sql
create table public.place_cache (
  id uuid primary key default gen_random_uuid(),
  geohash text not null,            -- 위경도를 일정 정밀도로 반올림한 키
  category text not null,           -- 'cafe' | 'attraction' | 'walk'
  places_json jsonb not null,       -- Google Places API 응답 원본(필요 필드만)
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create unique index on public.place_cache (geohash, category);

alter table public.place_cache enable row level security;

create policy "누구나 캐시 조회 가능"
  on public.place_cache for select
  using (true);

-- 쓰기는 Edge Function(service role)에서만 수행
```

---

## 6. saved_items — 여행 기록 저장 (R-ACT, F6)

음악/장소를 함께 담는 통합 저장함. `item_type`으로 구분.

```sql
create type saved_item_type as enum ('music', 'place');

create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  item_type saved_item_type not null,
  reference_id text not null,       -- spotify track/playlist id 또는 google place_id
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
```

---

## 7. testimonials — 첫 여행자 후기 (R-ONBOARD, F7)

운영자가 관리하는 콘텐츠 테이블. 앱 업데이트 없이 후기를 추가/교체할 수 있도록 DB로 관리.

```sql
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_label text not null,       -- 예: "첫 나홀로 여행자, 20대"
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
```

---

## 8. safety_checklist_items — 안전 체크리스트 (R-ONBOARD, F8)

```sql
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
```

---

## 9. events — 범용 사용 로그 (성공 지표 측정용)

무드 추천/활동 클릭/앱 재실행 등 다양한 이벤트를 한 테이블에 유연하게 기록. 지표별 전용 테이블을 늘리지 않기 위한 선택.

```sql
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,   -- 예: 'app_opened', 'place_clicked', 'mood_played'
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index on public.events (user_id, event_type, created_at desc);

alter table public.events enable row level security;

create policy "본인 이벤트만 작성 가능"
  on public.events for insert
  with check (auth.uid() = user_id);
```

---

## ERD 요약

```
auth.users (Supabase 관리)
  └─ profiles (1:1)
       ├─ trips (1:N)
       │    ├─ mood_recommendations (1:N)
       │    └─ saved_items (1:N, trip_id nullable)
       ├─ spotify_connections (1:1)
       ├─ saved_items (1:N)
       └─ events (1:N)

place_cache        (독립, geohash+category 캐시)
testimonials       (독립, 콘텐츠)
safety_checklist_items (독립, 콘텐츠)
```

## 미해결 이슈
- `mood_recommendations`에 반영할 추가 신호(직전 활동, 날씨 등)는 PRD 원문대로 데이터가 쌓인 뒤 컬럼 추가 검토.
- `place_cache`의 geohash 정밀도(반경 몇 m 단위로 캐싱할지)는 구글 플레이스 API 쿼터 사용량을 보며 튜닝.
