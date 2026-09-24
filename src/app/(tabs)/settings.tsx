import { router } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

// docs/screens.md #9: profile edit, music taste, safety checklist recall,
// logout. No music account connection here — F3/F4 uses Deezer's public
// search, which needs no per-user login.
export default function SettingsScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(onboarding)/login');
  };

  return (
    <ScreenContainer>
      <ThemedText type="title">설정</ThemedText>
      <PrimaryButton
        label="안전 체크리스트 다시 보기"
        variant="outline"
        onPress={() => router.push('/(onboarding)/safety-checklist')}
      />
      <PrimaryButton label="로그아웃" variant="outline" onPress={handleLogout} />
    </ScreenContainer>
  );
}
