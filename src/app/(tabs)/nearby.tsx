import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useLocation } from '@/hooks/use-location';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { distanceInMeters, fetchNearbyPlaces, formatDistance, type NearbyPlace, type PlaceCategory } from '@/lib/places';
import { getActiveTrip } from '@/lib/profile';
import { saveItem } from '@/lib/saved-items';

// R-ACT (F5/F6, docs/screens.md #7). Calls the `nearby-places` Edge
// Function (which itself checks `place_cache` before hitting Google) and
// lets the traveler save a place to `saved_items`.
const CATEGORIES: { key: PlaceCategory; label: string }[] = [
  { key: 'cafe', label: '카페' },
  { key: 'attraction', label: '볼거리' },
  { key: 'walk', label: '산책로' },
];

export default function NearbyScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const location = useLocation();
  const [category, setCategory] = useState<PlaceCategory>('cafe');
  const [tripId, setTripId] = useState<string | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) return;
    getActiveTrip(session.user.id).then((trip) => setTripId(trip?.id ?? null));
  }, [session]);

  useEffect(() => {
    if (location.status !== 'granted') return;
    setLoading(true);
    fetchNearbyPlaces({ latitude: location.coords.latitude, longitude: location.coords.longitude, category })
      .then(setPlaces)
      .catch((error) => Alert.alert('주변 활동을 불러오지 못했어요', error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  }, [location.status, category]);

  const handleSave = async (place: NearbyPlace) => {
    if (!session) return;
    try {
      await saveItem({
        user_id: session.user.id,
        trip_id: tripId,
        item_type: 'place',
        reference_id: place.placeId,
        title: place.name,
        image_url: null,
        metadata: { address: place.address, rating: place.rating, category },
      });
      setSavedIds((prev) => new Set(prev).add(place.placeId));
    } catch (error) {
      Alert.alert('저장에 실패했어요', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">주변 활동</ThemedText>
      <View style={styles.tabs}>
        {CATEGORIES.map((item) => {
          const isActive = item.key === category;
          return (
            <Pressable
              key={item.key}
              onPress={() => setCategory(item.key)}
              style={[
                styles.tab,
                { borderColor: theme.backgroundSelected },
                isActive && { backgroundColor: theme.backgroundSelected },
              ]}>
              <ThemedText type="small">{item.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>

      {location.status === 'denied' ? (
        <ThemedText type="default" themeColor="textSecondary">
          위치 권한이 없어 주변 활동을 보여드릴 수 없어요. 설정에서 위치 권한을 허용해주세요.
        </ThemedText>
      ) : loading || location.status === 'loading' ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.placeId}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="default" themeColor="textSecondary">
              이 주변에서 찾은 곳이 없어요.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const distance =
              location.status === 'granted' && item.latitude !== null && item.longitude !== null
                ? formatDistance(
                    distanceInMeters(location.coords, { latitude: item.latitude, longitude: item.longitude }),
                  )
                : null;
            const isSaved = savedIds.has(item.placeId);
            return (
              <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {[distance, item.address, item.rating ? `★ ${item.rating}` : null].filter(Boolean).join(' · ')}
                </ThemedText>
                <Pressable onPress={() => handleSave(item)} disabled={isSaved}>
                  <ThemedText type="link" themeColor={isSaved ? 'textSecondary' : undefined}>
                    {isSaved ? '저장됨' : '저장하기'}
                  </ThemedText>
                </Pressable>
              </ThemedView>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tab: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  list: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
