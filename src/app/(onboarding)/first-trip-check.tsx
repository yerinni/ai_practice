import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { updateProfile } from '@/lib/profile';

// F2: profiles.is_first_trip branches onboarding — first-timers see
// Testimonials + SafetyChecklist, repeat travelers skip straight to the tabs.
export default function FirstTripCheckScreen() {
  const { session } = useSession();
  const [submitting, setSubmitting] = useState(false);

  const choose = async (isFirstTrip: boolean) => {
    if (!session) {
      router.replace('/(onboarding)/login');
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile(session.user.id, { is_first_trip: isFirstTrip });
      router.push({ pathname: '/(onboarding)/trip-setup', params: { isFirstTrip: String(isFirstTrip) } });
    } catch (error) {
      Alert.alert('저장에 실패했어요', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <ThemedText type="title">혼자 여행이 처음이신가요?</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          답변에 따라 온보딩 내용이 조금 달라져요.
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="네, 처음이에요" onPress={() => choose(true)} disabled={submitting} />
        <PrimaryButton label="아니요, 해봤어요" variant="outline" onPress={() => choose(false)} disabled={submitting} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  actions: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
