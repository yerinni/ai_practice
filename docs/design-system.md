# 디자인 시스템

앱의 색상, 타이포그래피, 간격, 컴포넌트 규칙을 정리한 문서입니다. 실제 코드는 `src/constants/theme.ts`에 토큰으로 정의되어 있고, 이 문서는 그 토큰들이 "왜" 이 값인지와 "어디에" 써야 하는지를 설명합니다. **토큰을 바꿀 땐 이 문서도 같이 업데이트하세요.**

## 무드

따뜻하고 편안한, 세피아·크림 톤. 혼자 여행하는 사람이 쉬어가는 순간에 켜는 앱이라 — 차갑고 기술적인 느낌보다는 볕 잘 드는 카페에 앉아 있는 듯한 느낌을 목표로 합니다.

## 색상 팔레트

`src/constants/theme.ts`의 `Colors.light` / `Colors.dark`.

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `background` | `#FBF5EC` (크림) | `#211812` (진한 브라운) | 화면 배경 |
| `backgroundElement` | `#F3E8D8` (연한 베이지) | `#2E221A` | 카드, 구분되는 영역 배경 |
| `backgroundSelected` | `#E7D2AE` (탠) | `#46341F` | 비활성 상태의 테두리/배경 (칩·탭의 기본 상태) |
| `text` | `#3A2B1E` (진한 브라운) | `#F2E6D3` (크림) | 본문 텍스트 |
| `textSecondary` | `#8A7360` | `#B8A48C` | 보조 텍스트, 캡션, 비활성 라벨 |
| `accent` | `#C1693F` (테라코타) | `#E0895A` (밝은 테라코타) | 브랜드 포인트 컬러 — 버튼, 선택된 칩/탭, 활성 탭 아이콘 |
| `accentText` | `#FFF8EF` | `#241A14` | `accent` 배경 위에 올라가는 텍스트 (대비 확보를 위해 라이트/다크 반대로 감) |

**규칙**
- 순수 검정/흰색은 쓰지 않습니다 — 항상 위 토큰의 따뜻한 색조를 사용하세요.
- 새 화면을 만들 때 색을 하드코딩하지 말고 `useTheme()`으로 가져온 값이나 `ThemedText`/`ThemedView`의 `themeColor`/`type` prop을 쓰세요.
- 파괴적 액션(삭제 등)은 `accent`가 아니라 `textSecondary`로 — accent는 "하고 싶은 긍정적 행동"에만 씁니다.

## 타이포그래피

`ThemedText`의 `type` prop (`src/components/themed-text.tsx`).

| type | 크기/줄높이 | 폰트 | 용도 |
|---|---|---|---|
| `title` | 40px / 46px, bold | 둥근 시스템 폰트(`Fonts.rounded`) | 화면 최상단 제목 (예: "지금 이 순간") |
| `subtitle` | 26px / 34px, bold | 둥근 시스템 폰트 | 화면 안의 섹션 제목 |
| `default` | 16px / 24px | 기본 | 본문 |
| `smallBold` | 14px / 20px, bold | 기본 | 카드 제목, 라벨 |
| `small` | 14px / 20px | 기본 | 캡션, 보조 정보 |
| `link` / `linkPrimary` | 14px / 30px | 기본 | 텍스트 버튼 (linkPrimary는 기본색이 `accent`) |
| `code` | 12px | 모노스페이스 | 코드/디버그용, 앱 UI에서는 거의 안 씀 |

`title`/`subtitle`에 둥근 폰트(`ui-rounded`)를 쓰는 건 iOS에서만 실제로 적용됩니다(Android/웹은 시스템 기본 폰트로 대체) — 브랜드 폰트를 새로 추가하기 전까지는 이 정도로 "부드러운" 인상을 냅니다.

## 간격 (Spacing)

`src/constants/theme.ts`의 `Spacing`. 4px 배수 스케일입니다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `half` | 2px | 아주 미세한 간격 |
| `one` | 4px | 아이콘-텍스트 사이 등 |
| `two` | 8px | 칩 사이 간격, 작은 padding |
| `three` | 16px | 기본 컴포넌트 padding, 리스트 아이템 간격 |
| `four` | 24px | 섹션 간격, 카드 padding |
| `five` | 32px | 큰 섹션 구분 |
| `six` | 64px | 거의 안 씀 (스플래시 등 특수 레이아웃) |

## 모서리 반경 (Radius)

`src/constants/theme.ts`의 `Radius`.

| 토큰 | 값 | 용도 |
|---|---|---|
| `small` | 8px | 아직 사용처 없음 (예약) |
| `medium` | 12px | 입력창(TextInput) |
| `large` | 16px | 리스트 카드 (주변 활동, 저장함, 후기) |
| `xlarge` | 20px | 홈 화면 추천 카드처럼 강조하고 싶은 카드 |
| `pill` | 999px | 칩(ChipSelect), 카테고리/필터 탭 |

## 컴포넌트 규칙

### 버튼 (`PrimaryButton`)
- `solid`: `accent` 배경 + `accentText` 라벨. 화면당 하나의 주요 액션에만 사용 (예: "저장하기", "시작하기").
- `outline`: `accent` 테두리 + `accent` 라벨, 배경 투명. 보조 액션(취소, 뒤로, 대안 선택지)에 사용.
- 버튼 라벨은 모든 경우에 `smallBold` 타입.

### 칩 (`ChipSelect`)
- 선택 안 됨: `backgroundSelected` 테두리, 텍스트는 `text`.
- 선택됨: `accent` 배경 + 테두리, 텍스트는 `accentText`.
- 최대 선택 개수(`max`)는 항상 화면에 "(최대 N개)"로 안내.

### 카드 (`ThemedView type="backgroundElement"`)
- 배경은 항상 `backgroundElement`, 개별 색 지정 금지.
- 리스트 안 카드는 `Radius.large`, 단독으로 강조되는 카드(홈 추천)는 `Radius.xlarge`.

### 탭/필터 pill (주변 활동 카테고리, 저장함 필터)
- 칩과 동일한 선택 상태 규칙(`accent` 배경 + `accentText`)을 따릅니다 — 지금은 각 화면에 인라인으로 구현되어 있는데, 3번째로 같은 패턴이 더 생기면 `ChipSelect`를 단일 선택 모드로 확장하거나 별도 `TabPill` 컴포넌트로 뽑는 걸 고려하세요.

## 앞으로 다듬을 것
- `Radius.small`(8px)은 아직 실제로 쓰는 곳이 없음 — 작은 배지나 썸네일에 쓰게 되면 적용.
- 아이콘 색(`@expo/vector-icons`)은 현재 탭 아이콘에만 쓰이고 `tabBarActiveTintColor`/`tabBarInactiveTintColor`를 그대로 따라갑니다. 다른 곳에 아이콘을 추가할 때도 하드코딩 없이 `theme.accent`/`theme.textSecondary`를 넘기세요.
- 브랜드 전용 폰트 파일을 추가하면 `Fonts.rounded`를 대체할 수 있습니다 (`expo-font`로 로드 후 `theme.ts`에서 교체).
