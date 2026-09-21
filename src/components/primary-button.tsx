import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
}: {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, variant === 'outline' && styles.outline]}>
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
  solidLabel: {
    color: '#ffffff',
  },
});
