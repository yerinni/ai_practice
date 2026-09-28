import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
}) {
  const theme = useTheme();
  const isSolid = variant === 'solid';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        isSolid ? { backgroundColor: theme.accent } : { borderWidth: 1.5, borderColor: theme.accent },
        disabled && styles.disabled,
      ]}>
      <ThemedText type="smallBold" themeColor={isSolid ? 'accentText' : 'accent'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
