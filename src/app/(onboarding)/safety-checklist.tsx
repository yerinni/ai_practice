import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { updateProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import type { SafetyChecklistItem } from '@/types/database';

// F8: minimal safety checklist for first-timers, from
// `safety_checklist_items` (active=true, ordered by sort_order). Repeat
// travelers never reach this screen (see trip-setup.tsx branch).
export default function SafetyChecklistScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<SafetyChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('safety_checklist_items')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .then(({ data }) => {
        setItems((data as SafetyChecklistItem[] | null) ?? []);
        setLoading(false);
      });
  }, []);

  const handleDone = async () => {
    if (!session) {
      router.replace('/(onboarding)/login');
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile(session.user.id, { onboarding_completed_at: new Date().toISOString() });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('저장에 실패했어요', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">여행 전 꼭 확인하세요</ThemedText>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => (
            <View key={item.id}>
              <ThemedText type="default">•  {item.title}</ThemedText>
              {item.description ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {item.description}
                </ThemedText>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
      <View>
        <PrimaryButton label="확인했어요" onPress={handleDone} disabled={submitting} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
