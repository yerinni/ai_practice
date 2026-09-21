import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

// docs/screens.md #9: profile edit, Spotify connect/disconnect, music taste,
// safety checklist recall, logout. Each row is a stub until its owning
// feature (F1, F3/F4) is implemented.
export default function SettingsScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(onboarding)/login');
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">설정</ThemedText>
      <View style={styles.section}>
        <ThemedText type="default">스포티파이 연동</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          연결 안 됨
        </ThemedText>
      </View>
      <PrimaryButton
        label="안전 체크리스트 다시 보기"
        variant="outline"
        onPress={() => router.push('/(onboarding)/safety-checklist')}
      />
      <PrimaryButton label="로그아웃" variant="outline" onPress={handleLogout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.one,
  },
});
