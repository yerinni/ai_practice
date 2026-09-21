import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { deleteSavedItem, listSavedItems } from '@/lib/saved-items';
import type { SavedItem, SavedItemType } from '@/types/database';

// F6 (docs/screens.md #8): union of saved music + places from `saved_items`,
// ordered by saved_at desc.
const FILTERS: { key: SavedItemType | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'music', label: '음악' },
  { key: 'place', label: '장소' },
];

export default function SavedScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const [filter, setFilter] = useState<SavedItemType | 'all'>('all');
  const [items, setItems] = useState<SavedItem[]>([]);

  const load = useCallback(() => {
    if (!session) return;
    listSavedItems(session.user.id, filter === 'all' ? undefined : filter).then(setItems);
  }, [session, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = (item: SavedItem) => {
    const externalUrl = (item.metadata as { externalUrl?: string })?.externalUrl;
    if (externalUrl) Linking.openURL(externalUrl);
  };

  const handleDelete = async (item: SavedItem) => {
    try {
      await deleteSavedItem(item.id);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (error) {
      Alert.alert('삭제에 실패했어요', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">저장함</ThemedText>
      <View style={styles.tabs}>
        {FILTERS.map((item) => {
          const isActive = item.key === filter;
          return (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
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

      {items.length === 0 ? (
        <ThemedText type="default" themeColor="textSecondary">
          아직 저장한 게 없어요. 홈이나 주변 활동에서 마음에 드는 걸 저장해보세요.
        </ThemedText>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.card}>
              <Pressable onPress={() => handleOpen(item)}>
                <ThemedText type="smallBold">{item.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.item_type === 'music' ? '음악' : '장소'}
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => handleDelete(item)}>
                <ThemedText type="link">삭제</ThemedText>
              </Pressable>
            </ThemedView>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
