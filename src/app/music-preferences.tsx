import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ChipSelect } from '@/components/chip-select';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { GENRE_OPTIONS, MAX_SELECTION, MOOD_OPTIONS } from '@/constants/music-taste';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { getActiveTrip, updateTrip } from '@/lib/profile';

// Settings → "음악 취향 수정": trip-setup.tsx (F1) collects music_genres /
// mood_preferences once during onboarding but never let the traveler
// change their mind afterwards. This edits the same trip row.
export default function MusicPreferencesScreen() {
  const { session } = useSession();
  const [tripId, setTripId] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) return;
    getActiveTrip(session.user.id).then((trip) => {
      setTripId(trip?.id ?? null);
      setGenres(trip?.music_genres ?? []);
      setMoods(trip?.mood_preferences ?? []);
      setLoading(false);
    });
  }, [session]);

  const handleSave = async () => {
    if (!tripId) return;
    setSubmitting(true);
    try {
      await updateTrip(tripId, { music_genres: genres, mood_preferences: moods });
      router.back();
    } catch (error) {
      Alert.alert('저장에 실패했어요', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <ThemedText type="title">음악 취향 수정</ThemedText>
      </ScreenContainer>
    );
  }

  if (!tripId) {
    return (
      <ScreenContainer>
        <ThemedText type="title">음악 취향 수정</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          진행 중인 여행 정보를 찾을 수 없어요.
        </ThemedText>
        <PrimaryButton label="뒤로" variant="outline" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">음악 취향 수정</ThemedText>
        <View style={styles.section}>
          <ThemedText type="smallBold">음악 장르 (최대 {MAX_SELECTION}개)</ThemedText>
          <ChipSelect options={GENRE_OPTIONS} selected={genres} onChange={setGenres} max={MAX_SELECTION} />
        </View>
        <View style={styles.section}>
          <ThemedText type="smallBold">분위기 (최대 {MAX_SELECTION}개)</ThemedText>
          <ChipSelect options={MOOD_OPTIONS} selected={moods} onChange={setMoods} max={MAX_SELECTION} />
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <PrimaryButton label="저장하기" onPress={handleSave} disabled={submitting} />
        <PrimaryButton label="취소" variant="outline" onPress={() => router.back()} disabled={submitting} />
      </View>
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
  actions: {
    gap: Spacing.three,
  },
});
