import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ChipSelect } from '@/components/chip-select';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { insertTrip, updateProfile } from '@/lib/profile';

const GENRE_OPTIONS = ['인디', '팝', '재즈', '로파이', 'K-POP', '어쿠스틱'];
const MOOD_OPTIONS = ['차분한', '신나는', '몽환적인', '센치한', '경쾌한'];
const MAX_SELECTION = 3;

// F1: minimal trip profile — destination, dates, music taste. Kept to a
// single screen on purpose (see PRD "결정 피로 최소화"). Trip length is a
// day count rather than a date-range picker for now: a native date picker
// is an Expo/RN module whose current API this session couldn't verify
// against docs.expo.dev (blocked by network policy), so it's left for a
// follow-up once that can be checked instead of guessed from memory.
export default function TripSetupScreen() {
  const { isFirstTrip } = useLocalSearchParams<{ isFirstTrip: string }>();
  const { session } = useSession();
  const theme = useTheme();
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('3');
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!session) {
      router.replace('/(onboarding)/login');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('여행지를 입력해주세요.');
      return;
    }
    const dayCount = Number.parseInt(days, 10);
    if (!Number.isFinite(dayCount) || dayCount < 1) {
      Alert.alert('여행 기간을 1일 이상으로 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + dayCount - 1);
      const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

      await insertTrip({
        user_id: session.user.id,
        destination: destination.trim(),
        start_date: toDateOnly(startDate),
        end_date: toDateOnly(endDate),
        music_genres: genres,
        mood_preferences: moods,
        is_active: true,
      });

      if (isFirstTrip === 'true') {
        router.push('/(onboarding)/testimonials');
      } else {
        await updateProfile(session.user.id, { onboarding_completed_at: new Date().toISOString() });
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('저장에 실패했어요', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">여행 정보를 알려주세요</ThemedText>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="여행지 (예: 오사카)"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
        <TextInput
          value={days}
          onChangeText={setDays}
          placeholder="여행 기간 (일)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
        <View style={styles.section}>
          <ThemedText type="smallBold">음악 장르 (최대 {MAX_SELECTION}개)</ThemedText>
          <ChipSelect options={GENRE_OPTIONS} selected={genres} onChange={setGenres} max={MAX_SELECTION} />
        </View>
        <View style={styles.section}>
          <ThemedText type="smallBold">분위기 (최대 {MAX_SELECTION}개)</ThemedText>
          <ChipSelect options={MOOD_OPTIONS} selected={moods} onChange={setMoods} max={MAX_SELECTION} />
        </View>
      </ScrollView>
      <PrimaryButton label="시작하기" onPress={handleContinue} disabled={submitting} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    fontSize: 16,
  },
});
