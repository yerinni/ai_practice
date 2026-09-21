import { FlatList, StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// R-ACT (F5/F6, docs/screens.md #7). Reads from `place_cache` first
// (geohash + category), falling back to a Google Places API call proxied
// through a Supabase Edge Function when the cache misses or expires.
const CATEGORIES = ['카페', '볼거리', '산책로'];

const PLACEHOLDER_PLACES = [
  { id: '1', name: '동네 카페', distance: '350m' },
  { id: '2', name: '전망 좋은 산책로', distance: '700m' },
];

export default function NearbyScreen() {
  return (
    <ScreenContainer>
      <ThemedText type="title">주변 활동</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        {CATEGORIES.join(' · ')}
      </ThemedText>
      <FlatList
        data={PLACEHOLDER_PLACES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{item.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.distance}
            </ThemedText>
          </ThemedView>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
