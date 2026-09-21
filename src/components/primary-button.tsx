import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

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
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, variant === 'outline' && styles.outline, disabled && styles.disabled]}>
      <ThemedText type="smallBold" themeColor={variant === 'solid' ? undefined : 'text'} style={variant === 'solid' && styles.solidLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3c87f7',
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3c87f7',
  },
  disabled: {
    opacity: 0.5,
  },
  solidLabel: {
    color: '#ffffff',
  },
});
