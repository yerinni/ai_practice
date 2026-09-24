import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useLocation } from '@/hooks/use-location';
import { useSession } from '@/hooks/use-session';
import { insertMoodRecommendation, updateMoodRecommendationAction } from '@/lib/mood-recommendations';
import { getTimeOfDay, pickMoodTag, timeOfDayLabel, type TimeOfDay } from '@/lib/mood';
import { fetchMoodTrack, type MoodTrack } from '@/lib/music';
import { getActiveTrip } from '@/lib/profile';
import { saveItem } from '@/lib/saved-items';

// R-MOOD core screen (F3/F4, docs/screens.md #6): suggests one track with
// no questions asked, and lets the traveler swap it or save it. See
// src/lib/mood.ts for the time-of-day/mood-preference picking logic and
// supabase/functions/mood-track for where the actual search happens
// (Deezer, called server-side to keep this consistent with the other
// integrations even though it needs no secret).
export default function HomeScreen() {
  const { session } = useSession();
  const location = useLocation();

  const [tripId, setTripId] = useState<string | null>(null);
  const [tripMoodPreferences, setTripMoodPreferences] = useState<string[]>([]);
  const [tripLoaded, setTripLoaded] = useState(false);

  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [moodTag, setMoodTag] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);
  const [track, setTrack] = useState<MoodTrack | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    getActiveTrip(session.user.id).then((trip) => {
      setTripId(trip?.id ?? null);
      setTripMoodPreferences(trip?.mood_preferences ?? []);
      setTripLoaded(true);
    });
  }, [session]);

  useEffect(() => {
    if (!session || !tripLoaded || location.status === 'loading' || track) return;
    loadRecommendation();
    // Only fires once, when the trip + location are both known — a fresh
    // `loadRecommendation` identity every render would loop this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tripLoaded, location.status]);

  const loadRecommendation = async (excludeMood?: string) => {
    if (!session) return;
    setLoading(true);
    try {
      const nextTimeOfDay = getTimeOfDay();
      const mood = pickMoodTag({ timeOfDay: nextTimeOfDay, tripMoodPreferences, exclude: excludeMood });
      const nextTrack = await fetchMoodTrack(mood);
      const coords = location.status === 'granted' ? location.coords : null;
      const id = await insertMoodRecommendation({
        userId: session.user.id,
        tripId,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        timeOfDay: nextTimeOfDay,
        moodTag: mood,
        spotifyPlaylistId: nextTrack.id,
      });
      setTimeOfDay(nextTimeOfDay);
      setMoodTag(mood);
      setTrack(nextTrack);
      setRecommendationId(id);
    } catch (error) {
      Alert.alert('추천을 불러오지 못했어요', error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeMood = () => {
    if (recommendationId) {
      updateMoodRecommendationAction(recommendationId, 'changed').catch(() => {});
    }
    loadRecommendation(moodTag ?? undefined);
  };

  const handlePlay = () => {
    const url = track?.previewUrl ?? track?.externalUrl;
    if (!url) return;
    if (recommendationId) {
      updateMoodRecommendationAction(recommendationId, 'played').catch(() => {});
    }
    Linking.openURL(url);
  };

  const handleSave = async () => {
    if (!session || !track) return;
    try {
      await saveItem({
        user_id: session.user.id,
        trip_id: tripId,
        item_type: 'music',
        reference_id: track.id,
        title: track.name,
        image_url: track.imageUrl,
        metadata: { externalUrl: track.externalUrl },
      });
      Alert.alert('저장했어요');
    } catch (error) {
      Alert.alert('저장에 실패했어요', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">지금 이 순간</ThemedText>
      {loading || !track || !timeOfDay ? (
        <ActivityIndicator />
      ) : (
        <>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle">{timeOfDayLabel(timeOfDay)}</ThemedText>
            <ThemedText type="default">{track.name}</ThemedText>
            {location.status === 'denied' ? (
              <ThemedText type="small" themeColor="textSecondary">
                위치 권한이 없어 시간대 기준으로만 추천했어요.
              </ThemedText>
            ) : null}
          </ThemedView>
          <View style={styles.actions}>
            <PrimaryButton label="재생하기" onPress={handlePlay} />
            <PrimaryButton label="저장하기" variant="outline" onPress={handleSave} />
            <PrimaryButton label="다른 느낌으로" variant="outline" onPress={handleChangeMood} />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  actions: {
    gap: Spacing.three,
  },
});
