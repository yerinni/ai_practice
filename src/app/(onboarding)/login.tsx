import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ensureProfile, getProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

// F2 entry point (docs/screens.md #1). Email/password against Supabase Auth
// for now — social login (Google/Kakao) needs expo-auth-session wired to a
// verified Expo SDK 57 redirect flow, which is a separate follow-up once
// that can be checked against current docs rather than assumed from memory.
export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const afterAuth = async (userId: string) => {
    await ensureProfile(userId);
    const profile = await getProfile(userId);
    if (profile?.onboarding_completed_at) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)/first-trip-check');
    }
  };

  const handleAuth = async (mode: 'signIn' | 'signUp') => {
    if (!email || !password) {
      Alert.alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } =
        mode === 'signIn'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) {
        Alert.alert('가입 확인 메일을 보냈어요. 확인 후 로그인해주세요.');
        return;
      }
      await afterAuth(data.user.id);
    } catch (error) {
      Alert.alert('로그인에 실패했어요', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <ThemedText type="title">혼자, 하지만 혼자 같지 않게</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          여행 중 심심한 순간마다 지금 기분에 맞는 음악과 활동을 바로 제안해 드려요.
        </ThemedText>
      </View>
      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="로그인" onPress={() => handleAuth('signIn')} disabled={submitting} />
        <PrimaryButton label="회원가입" variant="outline" onPress={() => handleAuth('signUp')} disabled={submitting} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  form: {
    gap: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    fontSize: 16,
  },
  actions: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.four,
  },
});
