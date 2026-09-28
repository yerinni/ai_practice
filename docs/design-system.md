# 디자인 시스템

앱의 색상, 타이포그래피, 간격, 컴포넌트 규칙을 정리한 문서입니다. 실제 코드는 `src/constants/theme.ts`에 토큰으로 정의되어 있고, 이 문서는 그 토큰들이 "왜" 이 값인지와 "어디에" 써야 하는지를 설명합니다. **토큰을 바꿀 땐 이 문서도 같이 업데이트하세요.**

## 레퍼런스

Snapchat의 디자인 시스템(노란색 `#FFFC00` 브랜드 컬러, 플랫/무그림자, 필 형태 버튼)을 참고해서 만들었습니다. 다만 그대로 옮기지 않고 두 가지는 의도적으로 바꿨습니다.

1. **노란색은 절대 흰 배경 위의 글자/아이콘 색으로 쓰지 않는다.** `#FFFC00`은 흰색(`#FFFFFF`) 위에서 명도 대비가 거의 없어서 거의 안 보입니다. Snapchat 실제 서비스도 노랑을 "버튼/배지의 배경 + 그 위의 검정 텍스트" 조합으로만 쓰고, 흰 배경 위에 노란 텍스트를 쓰는 곳은 없습니다. 그래서 하단 탭 활성 아이콘, 링크 텍스트 같은 곳은 검정을 쓰고, 노랑은 항상 "칠해진 배경 + 검정 글씨" 형태로만 등장합니다.
2. **Ghost Sans는 못 씁니다.** Snap Inc.의 비공개 폰트라 저희가 라이선스를 가질 수 없어요. 대신 Avenir Next(iOS에 기본 내장된 시스템 폰트)만 적용했고, Android/웹에서는 시스템 기본 폰트로 자동 대체됩니다.

## 색상 팔레트

`src/constants/theme.ts`의 `Colors.light` / `Colors.dark`. 라이트/다크 모두 브랜드 컬러(`accent`/`accentText`)는 동일합니다 — Snapchat의 노랑도 테마에 따라 바뀌지 않는 고정 브랜드 색이기 때문입니다.

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `background` | `#FFFFFF` | `#121314` | 화면 배경 |
| `backgroundElement` | `#F0F1F2` | `#3A3E41` | 카드, 구분되는 영역 배경 |
| `backgroundSelected` | `#E4E5E7` | `#4C5155` | 비활성 칩/탭의 테두리 |
| `text` | `#121314` | `#FFFFFF` | 제목, 본문, 아이콘 |
| `textSecondary` | `#53575B` | `#C7C7CC` | 보조 텍스트, 캡션, 비활성 라벨 |
| `accent` | `#FFFC00` | `#FFFC00` | 브랜드 컬러 — **항상 배경으로만** (버튼, 선택된 칩/탭 배지) |
| `accentText` | `#000000` | `#000000` | `accent` 배경 위 텍스트 (항상 순검정) |

**규칙**
- `accent`(노랑)를 텍스트나 아이콘 색으로 단독 사용하지 않습니다. 항상 "accent 배경 + accentText 글씨" 조합으로만 씁니다.
- 파괴적 액션(삭제)은 `textSecondary`로 — 브랜드 컬러는 긍정적 액션에만 씁니다.
- 새 화면에서 색을 하드코딩하지 말고 `useTheme()` 또는 `ThemedText`/`ThemedView`의 `themeColor`/`type` prop을 쓰세요.

## 타이포그래피

`ThemedText`의 `type` prop (`src/components/themed-text.tsx`). 폰트는 `Fonts.brand`(Avenir Next DemiBold, 제목용) / `Fonts.brandMedium`(Avenir Next Medium, 본문용) — 둘 다 iOS 전용이고 다른 플랫폼은 시스템 기본 폰트로 대체됩니다.

| type | 크기/줄높이 | 굵기 | 용도 |
|---|---|---|---|
| `title` | 28px / 34px | Bold (brand) | 화면 최상단 제목 (예: "지금 이 순간") |
| `subtitle` | 20px / 28px | Bold (brand) | 화면 안의 섹션 제목 |
| `default` | 16px / 24px | Medium (brandMedium) | 본문 |
| `smallBold` | 14px / 20px | Bold (brand) | 카드 제목, 라벨 |
| `small` | 14px / 20px | Medium (brandMedium) | 캡션, 보조 정보 |
| `link` | 14px / 30px | Medium | 텍스트 버튼 |
| `linkPrimary` | 14px / 30px | Bold + 밑줄 | 강조 액션 링크 — 색 대신 **굵기+밑줄**로 강조 (노랑을 텍스트색으로 못 쓰니까) |
| `code` | 12px | 모노스페이스 | 코드/디버그용, 앱 UI에서는 거의 안 씀 |

## 간격 (Spacing)

`src/constants/theme.ts`의 `Spacing`. 4px 배수 스케일입니다. (변경 없음)

| 토큰 | 값 |
|---|---|
| `half` | 2px |
| `one` | 4px |
| `two` | 8px |
| `three` | 16px |
| `four` | 24px |
| `five` | 32px |
| `six` | 64px |

## 모서리 반경 (Radius)

`src/constants/theme.ts`의 `Radius`. Snapchat 스펙의 반경 스케일(Micro 5 / Small 8 / Large 64 / Full 9999)을 용도 기준 이름으로 옮겼습니다.

| 토큰 | 값 | Snapchat 스펙 근거 | 용도 |
|---|---|---|---|
| `input` | 5px | Login Text Input | TextInput (이메일, 여행지, 기간 입력 등) |
| `card` | 8px | Light/Dark Content Card | 모든 카드 (리스트 카드, 홈 추천 카드, 후기 카드 — 크기 구분 없이 통일) |
| `button` | 64px | Primary Yellow CTA | 버튼 — 세로 길이(50px 이상)보다 큰 반경이라 실제로는 완전한 필/스타디움 모양이 됨 |
| `pill` | 9999px | Yellow Emphasis Badge | 칩(ChipSelect), 카테고리/필터 탭 |

## 컴포넌트 규칙

### 버튼 (`PrimaryButton`)
- `solid`: `accent`(노랑) 배경 + `accentText`(검정) 라벨. Snapchat의 "Primary Yellow CTA" 그대로 — 화면당 하나의 주요 액션에만 사용.
- `outline`: 검정(`theme.text`) 테두리 + 검정 라벨, 배경 투명. 보조 액션(취소, 뒤로, 대안 선택지)에 사용 — Snapchat엔 정확히 대응하는 컴포넌트가 없어서, "브랜드=노랑, 나머지=검정"이라는 스펙의 이분법을 그대로 반영해 만든 버전입니다.
- 눌렀을 때 0.97로 살짝 축소되는 애니메이션 (Snapchat의 "Pill press" 모션 패턴).
- 최소 높이 50px — 반경 64px와 합쳐져 완전한 필 모양이 나옵니다.

### 칩 (`ChipSelect`) · 카테고리/필터 탭 (주변 활동, 저장함)
- 선택 안 됨: `backgroundSelected` 테두리, 텍스트는 `text`.
- 선택됨: `accent`(노랑) 배경 + `accentText`(검정) 텍스트 — Snapchat의 "Yellow Emphasis Badge"와 동일한 패턴.
- 최대 선택 개수(`max`)는 항상 화면에 "(최대 N개)"로 안내.

### 카드 (`ThemedView type="backgroundElement"`)
- 배경은 항상 `backgroundElement`, 그림자 없음(플랫) — Snapchat은 컴포넌트에 그림자를 쓰지 않고 색 대비만으로 구분합니다.
- 모든 카드 반경은 `Radius.card`(8px)로 통일.

### 액션 링크 (`ThemedText type="linkPrimary"`)
- 색 대신 **굵기(bold) + 밑줄**로 강조합니다. "저장하기" 같은 텍스트 액션 링크에 사용.
- 노랑을 텍스트 색으로 쓰지 않는다는 원칙 때문에 생긴 대안입니다.

## 앞으로 다듬을 것
- 카테고리/필터 탭이 3번째로 더 생기면 `ChipSelect`를 단일 선택 모드로 확장하거나 별도 `TabPill` 컴포넌트로 뽑는 걸 고려하세요.
- Ghost Sans에 대응하는 브랜드 폰트가 필요하면 `expo-font`로 커스텀 폰트를 로드해서 `Fonts.brand`/`Fonts.brandMedium`을 교체하면 됩니다.
- 이 세션에서는 시뮬레이터/실기기로 직접 렌더링을 확인할 방법이 없어서, `AvenirNext-DemiBold`/`AvenirNext-Medium` 폰트 문자열이 iOS에서 정확히 적용되는지는 실제 기기에서 확인해주세요 (문자열이 틀려도 크래시 없이 시스템 기본 폰트로 조용히 대체되니 안전합니다).
