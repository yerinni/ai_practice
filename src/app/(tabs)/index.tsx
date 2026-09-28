import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useLocation } from '@/hooks/use-location';
import { useSession } from '@/hooks/use-session';
import { insertMoodRecommendation, updateMoodRecommendationAction } from '@/lib/mood-recommendations';
import { getTimeOfDay, pickMoodTags, timeOfDayLabel, type TimeOfDay } from '@/lib/mood';
import { fetchMoodTrack, type MoodTrack } from '@/lib/music';
import { getActiveTrip } from '@/lib/profile';
import { saveItem } from '@/lib/saved-items';

const CARD_COUNT = 3;

interface Recommendation {
  recommendationId: string;
  moodTag: string;
  track: MoodTrack;
}

// R-MOOD core screen (F3/F4, docs/screens.md #6): suggests a handful of
// tracks with no questions asked, and lets the traveler swap them all or
// save any of them. See src/lib/mood.ts for the time-of-day/mood-preference
// picking logic and supabase/functions/mood-track for where the actual
// search happens (Deezer, called server-side to keep this consistent with
// the other integrations even though it needs no secret).
export default function HomeScreen() {
  const { session } = useSession();
  const location = useLocation();

  const [tripId, setTripId] = useState<string | null>(null);
  const [tripMoodPreferences, setTripMoodPreferences] = useState<string[]>([]);
  const [tripMusicGenres, setTripMusicGenres] = useState<string[]>([]);
  const [tripLoaded, setTripLoaded] = useState(false);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // useFocusEffect (not plain useEffect): the tabs navigator keeps this
  // screen mounted when you switch tabs, so a mount-only effect would never
  // notice that Settings → 음악 취향 수정 changed the trip's genres/moods.
  // Refetching on every focus means the next "다른 느낌으로" press picks up
  // the edit instead of using the stale values from when the tab first
  // mounted.
  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getActiveTrip(session.user.id).then((trip) => {
        setTripId(trip?.id ?? null);
        setTripMoodPreferences(trip?.mood_preferences ?? []);
        setTripMusicGenres(trip?.music_genres ?? []);
        setTripLoaded(true);
      });
    }, [session]),
  );

  useEffect(() => {
    if (!session || !tripLoaded || location.status === 'loading' || recommendations.length > 0) return;
    loadRecommendations();
    // Only fires once, when the trip + location are both known — a fresh
    // `loadRecommendations` identity every render would loop this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tripLoaded, location.status]);

  const loadRecommendations = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const nextTimeOfDay = getTimeOfDay();
      const moods = pickMoodTags({ timeOfDay: nextTimeOfDay, tripMoodPreferences }, CARD_COUNT);
      const coords = location.status === 'granted' ? location.coords : null;

      const settled = await Promise.allSettled(
        moods.map(async (mood, index) => {
          // Cycle through the traveler's chosen genres (trip-setup.tsx) so
          // each of the 3 cards reflects a genre they actually picked,
          // instead of ignoring music_genres entirely.
          const genre = tripMusicGenres.length > 0 ? tripMusicGenres[index % tripMusicGenres.length] : undefined;
          const track = await fetchMoodTrack(mood, genre);
          const recommendationId = await insertMoodRecommendation({
            userId: session.user.id,
            tripId,
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
            timeOfDay: nextTimeOfDay,
            moodTag: mood,
            spotifyPlaylistId: track.id,
          });
          return { recommendationId, moodTag: mood, track };
        }),
      );

      // One mood/genre combo failing to find a track (rare, but Deezer's
      // free-text search can come up empty for an unusual combo) shouldn't
      // blank out the other cards that did work.
      const next = settled.filter((result) => result.status === 'fulfilled').map((result) => result.value);
      if (next.length === 0) {
        const firstError = settled.find((result) => result.status === 'rejected') as PromiseRejectedResult | undefined;
        throw firstError?.reason ?? new Error('추천을 하나도 받지 못했어요.');
      }

      setTimeOfDay(nextTimeOfDay);
      setRecommendations(next);
    } catch (error) {
      Alert.alert('추천을 불러오지 못했어요', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeMood = () => {
    recommendations.forEach((item) => {
      updateMoodRecommendationAction(item.recommendationId, 'changed').catch(() => {});
    });
    loadRecommendations();
  };

  const handlePlay = (item: Recommendation) => {
    const url = item.track.previewUrl ?? item.track.externalUrl;
    if (!url) return;
    updateMoodRecommendationAction(item.recommendationId, 'played').catch(() => {});
    Linking.openURL(url);
  };

  const handleSave = async (item: Recommendation) => {
    if (!session) return;
    try {
      await saveItem({
        user_id: session.user.id,
        trip_id: tripId,
        item_type: 'music',
        reference_id: item.track.id,
        title: item.track.name,
        image_url: item.track.imageUrl,
        metadata: { externalUrl: item.track.externalUrl },
      });
      Alert.alert('저장했어요');
    } catch (error) {
      Alert.alert('저장에 실패했어요', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">지금 이 순간</ThemedText>
      {loading || recommendations.length === 0 || !timeOfDay ? (
        <ActivityIndicator />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list}>
            <ThemedText type="subtitle">{timeOfDayLabel(timeOfDay)}</ThemedText>
            {location.status === 'denied' ? (
              <ThemedText type="small" themeColor="textSecondary">
                위치 권한이 없어 시간대 기준으로만 추천했어요.
              </ThemedText>
            ) : null}
            {recommendations.map((item) => (
              <ThemedView key={item.recommendationId} type="backgroundElement" style={styles.card}>
                <ThemedText type="default">{item.track.name}</ThemedText>
                <View style={styles.cardActions}>
                  <PrimaryButton label="재생하기" onPress={() => handlePlay(item)} />
                  <PrimaryButton label="저장하기" variant="outline" onPress={() => handleSave(item)} />
                </View>
              </ThemedView>
            ))}
          </ScrollView>
          <PrimaryButton label="다른 느낌으로" variant="outline" onPress={handleChangeMood} />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  card: {
    borderRadius: Radius.xlarge,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardActions: {
    gap: Spacing.two,
  },
});
