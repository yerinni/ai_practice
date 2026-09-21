import { FlatList, StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// F6 (docs/screens.md #8): union of saved music + places from `saved_items`,
// ordered by saved_at desc. Filter chips (전체/음악/장소/여행별) come with
// the F5/F6 implementation pass.
const PLACEHOLDER_SAVED: { id: string; title: string; type: 'music' | 'place' }[] = [];

export default function SavedScreen() {
  return (
    <ScreenContainer>
      <ThemedText type="title">저장함</ThemedText>
      {PLACEHOLDER_SAVED.length === 0 ? (
        <ThemedText type="default" themeColor="textSecondary">
          아직 저장한 게 없어요. 홈이나 주변 활동에서 마음에 드는 걸 저장해보세요.
        </ThemedText>
      ) : (
        <FlatList
          data={PLACEHOLDER_SAVED}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.type === 'music' ? '음악' : '장소'}
              </ThemedText>
            </ThemedView>
          )}
        />
      )}
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
