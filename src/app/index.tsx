import { Redirect } from 'expo-router';

// TODO(F1/F2): once Supabase auth is wired up, check the session and
// `profiles.onboarding_completed_at` here and redirect to `/(tabs)` when the
// user already finished onboarding. For now every launch starts at login.
export default function Index() {
  return <Redirect href="/(onboarding)/login" />;
}
