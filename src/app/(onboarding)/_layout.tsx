import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="first-trip-check" />
      <Stack.Screen name="trip-setup" />
      <Stack.Screen name="testimonials" />
      <Stack.Screen name="safety-checklist" />
    </Stack>
  );
}
