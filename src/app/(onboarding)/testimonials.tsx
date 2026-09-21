import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { Testimonial } from '@/types/database';

// F7: first-timer reassurance content from `testimonials`
// (published=true, ordered by sort_order).
export default function TestimonialsScreen() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .then(({ data }) => {
        setTestimonials((data as Testimonial[] | null) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <ScreenContainer>
      <ThemedText type="title">먼저 다녀온 사람들의 이야기</ThemedText>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {testimonials.map((item) => (
            <ThemedView key={item.id} type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">{item.author_label}</ThemedText>
              <ThemedText type="default">{item.body}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      )}
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
