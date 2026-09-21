import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';


// F7: first-timer reassurance content, loaded from `testimonials`
// (published=true, ordered by sort_order). Hardcoded placeholders until the
// Supabase read is wired up.
const PLACEHOLDER_TESTIMONIALS = [
  { id: '1', authorLabel: '첫 나홀로 여행자, 20대', body: '처음엔 무서웠는데 막상 가보니 별일 없었어요.' },
  { id: '2', authorLabel: '첫 나홀로 여행자, 30대', body: '심심할 때마다 이 앱 켜고 음악 들으면서 걸었어요.' },
];

export default function TestimonialsScreen() {
  return (
    <ScreenContainer>
      <ThemedText type="title">먼저 다녀온 사람들의 이야기</ThemedText>
      <ScrollView contentContainerStyle={styles.list}>
        {PLACEHOLDER_TESTIMONIALS.map((item) => (
          <ThemedView key={item.id} type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{item.authorLabel}</ThemedText>
            <ThemedText type="default">{item.body}</ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
      <View>
        <PrimaryButton label="다음" onPress={() => router.push('/(onboarding)/safety-checklist')} />
      </View>
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
    gap: Spacing.two,
  },
});
