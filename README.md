# 나홀로 여행자의 "심심한 순간" 동반자 앱

혼자 여행하는 사람이 심심한 순간마다 지금 기분과 상황에 맞는 음악과 활동을 즉시 제안하는 Expo(React Native) 앱입니다. 기획 배경과 기능 정의는 [`docs/prd-v3.md`](docs/prd-v3.md)를 참고하세요.

- DB 스키마: [`docs/db-schema.md`](docs/db-schema.md)
- 화면 설계: [`docs/screens.md`](docs/screens.md)

## 기술 스택

Expo (React Native + TypeScript, Expo Router) + Supabase (Auth/Postgres/Edge Functions) + Spotify Web API + Google Places API.

## 시작하기

1. 의존성 설치

   ```bash
   npm install
   ```

2. 환경 변수 설정

   ```bash
   cp .env.example .env
   ```

   `.env`에 Supabase 프로젝트의 URL/anon key를 채워야 앱이 실행됩니다. `src/lib/supabase.ts`에서 값이 없으면 에러를 던집니다.

3. Supabase 테이블 생성

   `docs/db-schema.md`의 SQL을 Supabase 프로젝트 SQL editor에서 실행하세요. `testimonials`/`safety_checklist_items`에 최소 1개 이상 행을 넣어야 온보딩 화면에 내용이 보입니다.

4. 앱 실행

   ```bash
   npx expo start
   ```

   출력에서 Android 에뮬레이터, iOS 시뮬레이터, Expo Go, 웹(`npm run web`) 중 원하는 방식으로 열 수 있습니다.

## 폴더 구조

```
src/
  app/
    (onboarding)/   # 로그인 → 첫 여행 체크 → 여행 정보 → (첫 여행자만) 후기 → 안전 체크리스트
    (tabs)/         # 지금(무드 추천) · 주변 활동 · 저장함 · 설정
  components/       # 공용 UI (ThemedText/ThemedView, PrimaryButton, ScreenContainer, ChipSelect)
  hooks/use-session.ts # Supabase 세션 구독 훅
  lib/supabase.ts   # Supabase 클라이언트
  lib/profile.ts    # profiles/trips 읽기·쓰기 헬퍼
  types/database.ts # docs/db-schema.md와 동기화되는 테이블 타입 (수동 작성 — 아직 Supabase 프로젝트에 스키마를 올리기 전이라 `supabase gen types`를 쓰지 않았습니다)
```

각 화면 파일 상단 주석에 어떤 PRD 기능(F1~F8)과 연결되는지, 아직 붙이지 않은 실제 데이터/API 연동이 무엇인지 TODO로 남겨두었습니다.

`app.json`의 `web.output`은 `single`(SPA)로 설정되어 있습니다. 기본값인 `static`은 라우트를 Node 환경에서 서버 프리렌더링하는데, `@react-native-async-storage/async-storage`가 그 환경에서 `window`를 찾다가 빌드가 죽는 걸 확인해서(이 앱은 모바일 우선이라 SSR/SEO가 필요 없기도 하고) `single`로 바꿨습니다.

## 진행 상황

- ✅ F1, F2 — 이메일/비밀번호 로그인, 첫 여행 체크, 여행 정보 입력까지 Supabase 연동 완료. 소셜 로그인과 날짜 range picker는 `docs/screens.md`에 적어둔 이유로 보류 중.
- ⬜ F3, F4 — 스포티파이 연동 무드 음악 추천 (핵심 기능, 다음 순서)
- ⬜ F5, F6 — 구글 플레이스 연동 활동 추천
- ⬜ F7, F8 — 화면은 있지만 콘텐츠는 Supabase 테이블에서 읽어오는 정도까지만 (관리자 콘텐츠 입력 도구는 없음)
