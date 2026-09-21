import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

// F-entry point (see docs/screens.md #1 Login). Social auth (Google/Kakao/Apple)
// against Supabase Auth is wired up as part of the F1/F2 implementation pass —
// this screen currently just moves the flow forward so the rest of onboarding
// can be built and reviewed end to end.
export default function LoginScreen() {
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <ThemedText type="title">혼자, 하지만 혼자 같지 않게</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          여행 중 심심한 순간마다 지금 기분에 맞는 음악과 활동을 바로 제안해 드려요.
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="구글로 계속하기" onPress={() => router.push('/(onboarding)/first-trip-check')} />
        <PrimaryButton
          label="카카오로 계속하기"
          variant="outline"
          onPress={() => router.push('/(onboarding)/first-trip-check')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  actions: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
