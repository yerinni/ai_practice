import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// F1: minimal trip profile — destination, dates, music taste. Kept to a
// single screen on purpose (see PRD "결정 피로 최소화"); genre/mood pickers
// are stubbed as text input here and become chip selectors in the F1 build-out.
export default function TripSetupScreen() {
  const { isFirstTrip } = useLocalSearchParams<{ isFirstTrip: string }>();
  const theme = useTheme();

  const handleContinue = () => {
    // TODO(F1): insert into `trips` (destination, start_date, end_date,
    // music_genres, mood_preferences) via Supabase.
    if (isFirstTrip === 'true') {
      router.push('/(onboarding)/testimonials');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <ThemedText type="title">여행 정보를 알려주세요</ThemedText>
        <TextInput
          placeholder="여행지 (예: 오사카)"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
        <TextInput
          placeholder="음악 취향 (예: 잔잔한, 인디)"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
      </View>
      <PrimaryButton label="시작하기" onPress={handleContinue} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    fontSize: 16,
  },
});
