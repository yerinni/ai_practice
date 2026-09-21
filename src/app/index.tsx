import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { useSession } from '@/hooks/use-session';
import { getProfile } from '@/lib/profile';

// F2: routes returning users straight to the tabs once
// `profiles.onboarding_completed_at` is set, and everyone else into the
// onboarding stack.
export default function Index() {
  const { session, loading: sessionLoading } = useSession();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setOnboardingDone(null);
      return;
    }
    getProfile(session.user.id).then((profile) => {
      setOnboardingDone(Boolean(profile?.onboarding_completed_at));
    });
  }, [session, sessionLoading]);

  if (sessionLoading || (session && onboardingDone === null)) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  if (!session) {
    return <Redirect href="/(onboarding)/login" />;
  }

  return <Redirect href={onboardingDone ? '/(tabs)' : '/(onboarding)/first-trip-check'} />;
}
