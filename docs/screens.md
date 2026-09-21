# 화면 설계 (Expo / React Native)

> PRD v3 기능(F1~F8) 기준. 네비게이션은 Expo Router 사용, 온보딩은 스택(Stack) 네비게이터, 온보딩 완료 후에는 하단 탭(Tab) 네비게이터로 전환한다.

---

## 전체 네비게이션 구조

```
(온보딩 스택 — 최초 1회, profiles.onboarding_completed_at 없을 때만)
  Login → FirstTripCheck → TripSetup → [is_first_trip=true인 경우만] Testimonials → SafetyChecklist
     ↓ (완료)
(메인 탭 네비게이터)
  ┌─────────────┬─────────────┬─────────────┬─────────────┐
  │  홈(지금)    │  주변 활동   │  저장함      │  설정        │
  └─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 1. Login — 로그인

- **관련 기능**: 없음 (진입 조건)
- **구성**: 소셜 로그인 버튼(구글/카카오/애플), 서비스 한 줄 소개 문구
- **다음 화면**: 로그인 성공 시 `profiles` 존재 여부 확인 →
  - 없으면 신규 생성 후 `FirstTripCheck`로 이동
  - `onboarding_completed_at`이 있으면 바로 메인 탭(홈)으로 이동

---

## 2. FirstTripCheck — 첫 여행 여부 체크 (F2)

- **구성**: "혼자 여행이 처음이신가요?" 질문 + Yes/No 버튼 2개
- **분기**:
  - Yes → `profiles.is_first_trip = true` 저장 → `TripSetup` → `Testimonials` → `SafetyChecklist`
  - No → `profiles.is_first_trip = false` 저장 → `TripSetup` → (Testimonials, SafetyChecklist 생략) → 메인 탭

---

## 3. TripSetup — 최소 정보 온보딩 (F1)

- **구성**: 단일 화면(또는 3단계 스와이프)
  - 여행지 입력 (텍스트 또는 도시 검색 자동완성)
  - 여행 기간 선택 (시작일~종료일 date picker)
  - 음악 취향 선택 (장르 chip 다중 선택, 분위기 chip 다중 선택) — 최대 3~5개 정도로 제한해 결정 피로 최소화
- **액션**: "시작하기" 버튼 → `trips` insert
- **다음 화면**: `is_first_trip` 값에 따라 분기 (위 참조)

---

## 4. Testimonials — 첫 혼자여행자 후기 (F7, 첫 여행자 전용)

- **구성**: 카드형 스와이프 캐러셀. `testimonials` 테이블에서 `published=true`, `sort_order` 순으로 로드
  - 각 카드: 후기 텍스트, 작성자 라벨(예: "첫 나홀로 여행자, 20대")
- **액션**: "다음" 버튼 (스킵 불가 — 첫 여행자 대상이므로 안심 콘텐츠 노출이 목적)
- **다음 화면**: `SafetyChecklist`

---

## 5. SafetyChecklist — 기본 안전 체크리스트 (F8)

- **구성**: `safety_checklist_items`에서 `active=true` 항목을 체크리스트 형태로 표시 (공공장소 이용, 일정 공유 등)
- **액션**:
  - 첫 여행자: "확인했어요" 버튼만 노출 (스킵 버튼 없음)
  - 반복 사용자: 애초에 이 화면 자체를 건너뜀 (FirstTripCheck에서 No 선택 시 미노출)
- **완료 시**: `profiles.onboarding_completed_at = now()` 저장 → 메인 탭(홈)으로 이동

---

## 6. 홈 (지금 이 순간) — 메인 탭 1 (F3, F4)

- **관련 기능**: R-MOOD 핵심 화면
- **구성**:
  - 진입 즉시 질문 없이 무드 추천 카드 1개 자동 표시 (위치+시간대+취향 기반)
    - 플레이리스트 커버, 무드 태그(예: "차분한 저녁"), 재생 버튼
  - 하단에 "다른 느낌으로" 버튼 (F4) — 누르면 새로운 추천으로 교체, `mood_recommendations` 행 추가 및 이전 행 `action='changed'` 처리
  - 저장 아이콘(♥) — 누르면 `saved_items`에 저장
- **로딩 상태**: 위치 권한 요청 → 최초 1회만, 이후는 백그라운드에서 재요청
- **빈 상태/에러**: 위치 권한 거부 시 도시 이름 수동 입력으로 대체 추천

---

## 7. 주변 활동 — 메인 탭 2 (F5, F6)

- **관련 기능**: R-ACT
- **구성**:
  - 상단 카테고리 탭: 카페 / 볼거리 / 산책로
  - 리스트 뷰(기본) — 카드마다 사진, 이름, 거리, 저장 아이콘
  - (선택) 지도 뷰 토글 — MVP 범위 밖이면 리스트만으로 시작
- **액션**: 카드의 저장 아이콘 → `saved_items` insert (`item_type='place'`)
- **데이터**: `place_cache` 우선 조회 → 캐시 없으면 Edge Function 통해 Google Places API 호출 후 캐싱

---

## 8. 저장함 (여행 기록) — 메인 탭 3 (F6)

- **구성**:
  - 상단 필터: 전체 / 음악 / 장소, 여행(trip)별 필터
  - 리스트: `saved_items`를 `saved_at desc`로 표시, 항목 탭 시 상세(음악이면 스포티파이로 열기, 장소면 지도 앱 연결)
  - 스와이프로 삭제 가능
- **빈 상태**: "아직 저장한 게 없어요" + 홈/주변 활동으로 이동 유도 문구

---

## 9. 설정 — 메인 탭 4

- **구성**:
  - 프로필 정보 (닉네임, 현재 여행 정보 수정)
  - 스포티파이 연동 상태 (연결/해제)
  - 음악 취향 재설정
  - 안전 체크리스트 다시 보기 (F8 — 반복 사용자도 원하면 다시 볼 수 있게)
  - 로그아웃

---

## 화면별 사용 데이터 요약

| 화면 | 주요 테이블 | 외부 API |
|---|---|---|
| Login | profiles | Supabase Auth |
| FirstTripCheck | profiles | - |
| TripSetup | trips | - |
| Testimonials | testimonials | - |
| SafetyChecklist | safety_checklist_items, profiles | - |
| 홈(지금 이 순간) | mood_recommendations, saved_items | Spotify Web API, 위치(Expo Location) |
| 주변 활동 | place_cache, saved_items | Google Places API |
| 저장함 | saved_items | - |
| 설정 | profiles, trips, spotify_connections | Spotify OAuth |

## 미해결 이슈
- 지도 뷰 포함 여부는 MVP 범위(F5)에서 제외하고 리스트로 시작, 사용자 반응 보고 추가 검토.
- Testimonials/SafetyChecklist를 "스킵 불가"로 설계했는데, 실제 이탈률을 보고 스킵 허용 여부 재검토 필요.
