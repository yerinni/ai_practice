import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// R-MOOD core screen (F3/F4, docs/screens.md #6). On mount this should:
// 1. get the device location (expo-location) and time of day
// 2. ask the Spotify integration for one playlist matching mood_tag
// 3. insert a `mood_recommendations` row with action='suggested'
// "다른 느낌으로" (F4) replaces the card and logs action='changed' on the
// previous row. None of that is wired up yet — this is layout only.
export default function HomeScreen() {
  return (
    <ScreenContainer>
      <ThemedText type="title">지금 이 순간</ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="subtitle">차분한 저녁</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          지금 위치와 시간대에 어울리는 플레이리스트예요.
        </ThemedText>
      </ThemedView>
      <View style={styles.actions}>
        <PrimaryButton label="재생하기" onPress={() => {}} />
        <PrimaryButton label="다른 느낌으로" variant="outline" onPress={() => {}} />
      </View>
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
