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
import { getActiveTrip } from '@/lib/profile';
import { saveItem } from '@/lib/saved-items';
import { fetchMoodPlaylist, type MoodPlaylist } from '@/lib/spotify';

// R-MOOD core screen (F3/F4, docs/screens.md #6): suggests one playlist with
// no questions asked, and lets the traveler swap it or save it. See
// src/lib/mood.ts for the time-of-day/mood-preference picking logic and
// supabase/functions/spotify-mood-playlist for where the actual Spotify call
// happens (kept server-side so the client secret never ships in the app).
export default function HomeScreen() {
  const { session } = useSession();
  const location = useLocation();

  const [tripId, setTripId] = useState<string | null>(null);
  const [tripMoodPreferences, setTripMoodPreferences] = useState<string[]>([]);
  const [tripLoaded, setTripLoaded] = useState(false);

  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [moodTag, setMoodTag] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);
  const [playlist, setPlaylist] = useState<MoodPlaylist | null>(null);
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
    if (!session || !tripLoaded || location.status === 'loading' || playlist) return;
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
      const nextPlaylist = await fetchMoodPlaylist(mood);
      const coords = location.status === 'granted' ? location.coords : null;
      const id = await insertMoodRecommendation({
        userId: session.user.id,
        tripId,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        timeOfDay: nextTimeOfDay,
        moodTag: mood,
        spotifyPlaylistId: nextPlaylist.id,
      });
      setTimeOfDay(nextTimeOfDay);
      setMoodTag(mood);
      setPlaylist(nextPlaylist);
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
    if (!playlist?.externalUrl) return;
    if (recommendationId) {
      updateMoodRecommendationAction(recommendationId, 'played').catch(() => {});
    }
    Linking.openURL(playlist.externalUrl);
  };

  const handleSave = async () => {
    if (!session || !playlist) return;
    try {
      await saveItem({
        user_id: session.user.id,
        trip_id: tripId,
        item_type: 'music',
        reference_id: playlist.id,
        title: playlist.name,
        image_url: playlist.imageUrl,
        metadata: { externalUrl: playlist.externalUrl },
      });
      Alert.alert('저장했어요');
    } catch (error) {
      Alert.alert('저장에 실패했어요', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">지금 이 순간</ThemedText>
      {loading || !playlist || !timeOfDay ? (
        <ActivityIndicator />
      ) : (
        <>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle">{timeOfDayLabel(timeOfDay)}</ThemedText>
            <ThemedText type="default">{playlist.name}</ThemedText>
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
