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

3. 앱 실행

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
  components/       # 공용 UI (ThemedText/ThemedView, PrimaryButton, ScreenContainer)
  lib/supabase.ts   # Supabase 클라이언트
  types/database.ts # docs/db-schema.md와 동기화되는 테이블 타입
```

각 화면 파일 상단 주석에 어떤 PRD 기능(F1~F8)과 연결되는지, 아직 붙이지 않은 실제 데이터/API 연동이 무엇인지 TODO로 남겨두었습니다.

## 개발 우선순위

`docs/prd-v3.md` 6절 기준:

1. F1, F2 — 최소 온보딩
2. F3, F4 — 스포티파이 연동 무드 음악 추천 (핵심 기능)
3. F5, F6 — 구글 플레이스 연동 활동 추천
4. F7, F8 — 첫 여행자 온보딩 콘텐츠
