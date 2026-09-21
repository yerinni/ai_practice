import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

// F8: minimal safety checklist for first-timers, loaded from
// `safety_checklist_items` (active=true, ordered by sort_order). Repeat
// travelers never reach this screen (see first-trip-check.tsx branch).
const PLACEHOLDER_ITEMS = [
  '숙소·일정을 지인에게 공유해두기',
  '늦은 밤엔 공공장소·번화가 위주로 이동하기',
  '현지 긴급 연락처 미리 저장해두기',
];

export default function SafetyChecklistScreen() {
  const handleDone = () => {
    // TODO(F8): persist `profiles.onboarding_completed_at = now()` via Supabase.
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">여행 전 꼭 확인하세요</ThemedText>
      <ScrollView contentContainerStyle={styles.list}>
        {PLACEHOLDER_ITEMS.map((item) => (
          <ThemedText key={item} type="default">
            •  {item}
          </ThemedText>
        ))}
      </ScrollView>
      <View>
        <PrimaryButton label="확인했어요" onPress={handleDone} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
