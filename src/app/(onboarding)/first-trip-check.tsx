import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

// F2: profiles.is_first_trip branches onboarding — first-timers see
// Testimonials + SafetyChecklist, repeat travelers skip straight to the tabs.
export default function FirstTripCheckScreen() {
  const choose = (isFirstTrip: boolean) => {
    // TODO(F2): persist `profiles.is_first_trip = isFirstTrip` via Supabase.
    router.push({ pathname: '/(onboarding)/trip-setup', params: { isFirstTrip: String(isFirstTrip) } });
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <ThemedText type="title">혼자 여행이 처음이신가요?</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          답변에 따라 온보딩 내용이 조금 달라져요.
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="네, 처음이에요" onPress={() => choose(true)} />
        <PrimaryButton label="아니요, 해봤어요" variant="outline" onPress={() => choose(false)} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  actions: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
